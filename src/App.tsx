/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { TabPreferencesDiscovery } from './components/TabPreferencesDiscovery';
import { TabFlightConfirmation } from './components/TabFlightConfirmation';
import { TabItineraryBuilder } from './components/TabItineraryBuilder';
import { TabBookingsLogistics } from './components/TabBookingsLogistics';
import { TabTripSummaryShare } from './components/TabTripSummaryShare';
import { MCPInspectorModal } from './components/MCPInspectorModal';

import {
  TripPreferences,
  DestinationProposal,
  FlightOption,
  ItineraryDay,
  BookingItem,
  TripState,
  CurrencyCode,
  ActivityItem,
} from './types/travel';

import {
  DEFAULT_PREFERENCES,
  loadTripFromStorage,
  saveTripToStorage,
  clearTripStorage,
} from './services/localStorageDb';

import {
  discoverDestinations,
  searchFlights,
  generateItinerary,
  wetWeatherAutoReplan,
  getLogisticsCatalog,
} from './services/mcpClient';

export default function App() {
  const [currentTab, setCurrentTab] = useState<number>(1);
  const [preferences, setPreferences] = useState<TripPreferences>(DEFAULT_PREFERENCES);
  const [destinations, setDestinations] = useState<DestinationProposal[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<DestinationProposal | null>(null);
  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightOption | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string>('');
  const [isMcpInspectorOpen, setIsMcpInspectorOpen] = useState<boolean>(false);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState<boolean>(false);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState<boolean>(false);

  // Initial load from storage or default discovery fetch
  useEffect(() => {
    const saved = loadTripFromStorage();
    if (saved && saved.selectedDestination) {
      setPreferences(saved.preferences);
      setSelectedDestination(saved.selectedDestination);
      setSelectedFlight(saved.selectedFlight);
      setItinerary(saved.itinerary);
      setBookings(saved.bookings);
      setLastSavedAt(saved.lastSavedAt || new Date().toISOString());
      // Discover destinations in background
      discoverDestinations(saved.preferences).then((dests) => {
        setDestinations(dests);
        if (saved.selectedDestination) {
          searchFlights(saved.selectedDestination.code, saved.preferences.originCity, saved.preferences.originCountry).then(setFlights);
        }
      });
    } else {
      // First time initialization
      setIsLoadingDestinations(true);
      discoverDestinations(DEFAULT_PREFERENCES)
        .then(async (dests) => {
          setDestinations(dests);
          const defaultDest = dests[0];
          if (defaultDest) {
            setSelectedDestination(defaultDest);
            const foundFlights = await searchFlights(defaultDest.code, DEFAULT_PREFERENCES.originCity, DEFAULT_PREFERENCES.originCountry);
            setFlights(foundFlights);
            if (foundFlights.length > 0) {
              setSelectedFlight(foundFlights[0]);
            }
            const baseItinerary = await generateItinerary(
              defaultDest.city,
              { start: DEFAULT_PREFERENCES.startDate, end: DEFAULT_PREFERENCES.endDate },
              DEFAULT_PREFERENCES
            );
            setItinerary(baseItinerary);
            const initialLogistics = await getLogisticsCatalog(defaultDest.city);
            setBookings(initialLogistics);
          }
        })
        .finally(() => setIsLoadingDestinations(false));
    }
  }, []);

  // Auto-save state changes to local storage
  useEffect(() => {
    if (selectedDestination) {
      const stateToSave: TripState = {
        preferences,
        selectedDestination,
        selectedFlight,
        itinerary,
        bookings,
        lastSavedAt: new Date().toISOString(),
        tripName: `${selectedDestination.city} Expedition`,
      };
      saveTripToStorage(stateToSave);
      setLastSavedAt(stateToSave.lastSavedAt);
    }
  }, [preferences, selectedDestination, selectedFlight, itinerary, bookings]);

  // Handler: Update preferences & trigger re-ranking and flight update
  const handleUpdatePreferences = (updated: Partial<TripPreferences>) => {
    const newPrefs = { ...preferences, ...updated };
    setPreferences(newPrefs);

    if ((updated.originCity || updated.originCountry) && selectedDestination) {
      searchFlights(selectedDestination.code, newPrefs.originCity, newPrefs.originCountry).then((foundFlights) => {
        setFlights(foundFlights);
        if (foundFlights.length > 0) {
          setSelectedFlight(foundFlights[0]);
        }
      });
    }
  };

  // Handler: Refresh destination proposals
  const handleRefreshProposals = async () => {
    setIsLoadingDestinations(true);
    try {
      const dests = await discoverDestinations(preferences);
      setDestinations(dests);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDestinations(false);
    }
  };

  // Handler: Select a proposed destination
  const handleSelectDestination = async (dest: DestinationProposal) => {
    setSelectedDestination(dest);
    try {
      const foundFlights = await searchFlights(dest.code, preferences.originCity, preferences.originCountry);
      setFlights(foundFlights);
      if (foundFlights.length > 0) {
        setSelectedFlight(foundFlights[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Confirm Destination & Flight, then build base itinerary
  const handleConfirmAndBuildItinerary = async () => {
    if (!selectedDestination) return;
    setIsGeneratingItinerary(true);
    try {
      const days = await generateItinerary(
        selectedDestination.city,
        { start: preferences.startDate, end: preferences.endDate },
        preferences
      );
      setItinerary(days);

      // Load bookings catalog if not yet loaded
      if (bookings.length === 0) {
        const logistics = await getLogisticsCatalog(selectedDestination.city);
        setBookings(logistics);
      }

      setCurrentTab(3); // Transition directly to Itinerary Builder
    } catch (err) {
      console.error('Failed to generate base itinerary:', err);
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  // Handler: Wet-Weather Contingency Non-Destructive Auto-Replanning Toggle
  const handleToggleRainMode = async (dayNumber: number) => {
    const dayIndex = itinerary.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIndex === -1) return;

    const currentDay = itinerary[dayIndex];

    if (!currentDay.rainModeActive) {
      // Activating Rain Mode:
      // Store backup of original activities for non-destructive reversal!
      const originalActivitiesBackup = JSON.parse(JSON.stringify(currentDay.activities));

      try {
        const replanResult = await wetWeatherAutoReplan(dayNumber, currentDay.activities);

        setItinerary((prev) => {
          const updated = [...prev];
          updated[dayIndex] = {
            ...currentDay,
            rainModeActive: true,
            originalActivities: originalActivitiesBackup,
            activities: replanResult.activities,
            replanningReason: replanResult.reason,
          };
          return updated;
        });
      } catch (err) {
        console.error('Rain replan error:', err);
      }
    } else {
      // Deactivating Rain Mode: Revert back to original sunny day activities!
      setItinerary((prev) => {
        const updated = [...prev];
        const restoredActivities = currentDay.originalActivities && currentDay.originalActivities.length > 0
          ? currentDay.originalActivities
          : currentDay.activities;

        updated[dayIndex] = {
          ...currentDay,
          rainModeActive: false,
          activities: restoredActivities,
          replanningReason: undefined,
        };
        return updated;
      });
    }
  };

  // Handler: Reorder activities in itinerary
  const handleMoveActivity = (dayNumber: number, activityIndex: number, direction: 'up' | 'down') => {
    setItinerary((prev) => {
      const updated = [...prev];
      const dayIndex = updated.findIndex((d) => d.dayNumber === dayNumber);
      if (dayIndex === -1) return prev;

      const activities = [...updated[dayIndex].activities];
      const targetIndex = direction === 'up' ? activityIndex - 1 : activityIndex + 1;

      if (targetIndex >= 0 && targetIndex < activities.length) {
        // Swap activities
        const temp = activities[activityIndex];
        activities[activityIndex] = activities[targetIndex];
        activities[targetIndex] = temp;
        updated[dayIndex] = { ...updated[dayIndex], activities };
      }
      return updated;
    });
  };

  // Handler: Delete activity
  const handleDeleteActivity = (dayNumber: number, activityId: string) => {
    setItinerary((prev) => {
      const updated = [...prev];
      const dayIndex = updated.findIndex((d) => d.dayNumber === dayNumber);
      if (dayIndex === -1) return prev;

      updated[dayIndex] = {
        ...updated[dayIndex],
        activities: updated[dayIndex].activities.filter((a) => a.id !== activityId),
      };
      return updated;
    });
  };

  // Handler: Add custom activity
  const handleAddActivity = (dayNumber: number, newActivity: ActivityItem) => {
    setItinerary((prev) => {
      const updated = [...prev];
      const dayIndex = updated.findIndex((d) => d.dayNumber === dayNumber);
      if (dayIndex === -1) return prev;

      updated[dayIndex] = {
        ...updated[dayIndex],
        activities: [...updated[dayIndex].activities, newActivity],
      };
      return updated;
    });
  };

  // Handler: Confirm Booking item
  const handleConfirmBooking = (itemId: string, bookingRef: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === itemId
          ? {
              ...b,
              status: 'confirmed',
              bookingRef,
              confirmationDate: new Date().toLocaleDateString(),
            }
          : b
      )
    );
  };

  // Handler: Reset entire trip
  const handleResetTrip = () => {
    if (window.confirm('Reset all trip preferences, flight selections, and itinerary back to clean state?')) {
      clearTripStorage();
      setPreferences(DEFAULT_PREFERENCES);
      setSelectedDestination(null);
      setSelectedFlight(null);
      setItinerary([]);
      setBookings([]);
      setCurrentTab(1);
      discoverDestinations(DEFAULT_PREFERENCES).then(setDestinations);
    }
  };

  // Handler: Currency Change
  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setPreferences((prev) => ({ ...prev, currency: newCurrency }));
  };

  // Current consolidated TripState
  const fullTripState: TripState = {
    preferences,
    selectedDestination,
    selectedFlight,
    itinerary,
    bookings,
    lastSavedAt,
    tripName: selectedDestination ? `${selectedDestination.city} Expedition` : 'New Trip',
  };

  return (
    <div className="h-screen h-[100dvh] overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans select-none antialiased">
      {/* 1. Fixed Top Application Header */}
      <Header
        currentTab={currentTab}
        currency={preferences.currency}
        onCurrencyChange={handleCurrencyChange}
        selectedDestination={selectedDestination}
        onOpenMcpInspector={() => setIsMcpInspectorOpen(true)}
        onResetTrip={handleResetTrip}
        lastSavedAt={lastSavedAt}
      />

      {/* 2. Fixed Multi-Tab Navigation Stepper */}
      <NavigationTabs
        currentTab={currentTab}
        onSelectTab={(tabId) => setCurrentTab(tabId)}
        destinationConfirmed={Boolean(selectedDestination)}
        flightConfirmed={Boolean(selectedFlight)}
        itineraryReady={itinerary.length > 0}
      />

      {/* 3. Non-Scrolling Viewport Content Container */}
      <main className="flex-1 min-h-0 overflow-hidden relative">
        {currentTab === 1 && (
          <TabPreferencesDiscovery
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            destinations={destinations}
            selectedDestination={selectedDestination}
            onSelectDestination={handleSelectDestination}
            onProceedToFlights={() => setCurrentTab(2)}
            isLoading={isLoadingDestinations}
            onRefreshProposals={handleRefreshProposals}
          />
        )}

        {currentTab === 2 && (
          <TabFlightConfirmation
            destination={selectedDestination}
            preferences={preferences}
            flights={flights}
            selectedFlight={selectedFlight}
            onSelectFlight={setSelectedFlight}
            onConfirmAndBuildItinerary={handleConfirmAndBuildItinerary}
            onBackToDiscovery={() => setCurrentTab(1)}
            isGeneratingItinerary={isGeneratingItinerary}
          />
        )}

        {currentTab === 3 && (
          <TabItineraryBuilder
            destination={selectedDestination}
            preferences={preferences}
            itinerary={itinerary}
            onToggleRainMode={handleToggleRainMode}
            onMoveActivity={handleMoveActivity}
            onDeleteActivity={handleDeleteActivity}
            onAddActivity={handleAddActivity}
            onProceedToBookings={() => setCurrentTab(4)}
          />
        )}

        {currentTab === 4 && (
          <TabBookingsLogistics
            destination={selectedDestination}
            preferences={preferences}
            bookings={bookings}
            onConfirmBooking={handleConfirmBooking}
            onProceedToSummary={() => setCurrentTab(5)}
          />
        )}

        {currentTab === 5 && (
          <TabTripSummaryShare
            tripState={fullTripState}
            onNavigateToTab={(tabId) => setCurrentTab(tabId)}
          />
        )}
      </main>

      {/* 4. Smithery AI MCP Protocol Inspector Modal */}
      <MCPInspectorModal
        isOpen={isMcpInspectorOpen}
        onClose={() => setIsMcpInspectorOpen(false)}
      />
    </div>
  );
}
