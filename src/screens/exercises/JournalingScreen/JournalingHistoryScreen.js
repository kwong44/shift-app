import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar, FlatList, ActivityIndicator } from 'react-native';
import { Appbar, Text, Card, Paragraph, Title, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { COLORS, FONT, SPACING, RADIUS, SHADOWS } from '../../../config/theme';
import { getJournalEntries } from '../../../api/exercises/journaling';
import { useUser } from '../../../hooks/useUser';

// Debug logging
console.debug('JournalingHistoryScreen mounted');

const JournalingHistoryScreen = ({ navigation }) => {
  const { user } = useUser();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreEntries, setHasMoreEntries] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const ENTRIES_PER_PAGE = 10;

  const fetchEntries = useCallback(async (page = 0, query = '') => {
    if (!user?.id) {
      console.debug('[JournalingHistoryScreen] No user ID, cannot fetch entries.');
      setError('User not found. Please try again.');
      setLoading(false);
      setHasMoreEntries(false);
      return;
    }

    // Determine loading state based on context
    if (page === 0) {
        setLoading(true); // Full screen loader for initial load or new search
    } else {
        setIsFetchingMore(true); // Footer loader for pagination
    }
    setError(null);

    try {
      console.debug('[JournalingHistoryScreen] Fetching journal entries for user:', user.id, { page, query, limit: ENTRIES_PER_PAGE });
      
      // Note: The actual API `getJournalEntries` might need adjustment 
      // to support search query. Assuming it filters by content for now.
      // If the API doesn't support search, we might need to filter client-side or update the API.
      const fetchedEntries = await getJournalEntries(user.id, ENTRIES_PER_PAGE, page * ENTRIES_PER_PAGE, query);
      
      console.debug('[JournalingHistoryScreen] Entries fetched:', fetchedEntries?.length);

      if (fetchedEntries && fetchedEntries.length > 0) {
        setEntries(prevEntries => (page === 0 ? fetchedEntries : [...prevEntries, ...fetchedEntries]));
        setHasMoreEntries(fetchedEntries.length === ENTRIES_PER_PAGE);
      } else {
        if (page === 0) setEntries([]); // Clear if it's a new search with no results
        setHasMoreEntries(false);
      }
    } catch (err) {
      console.error('[JournalingHistoryScreen] Error fetching entries:', err);
      setError('Failed to load journal entries. Please try again later.');
      if (page === 0) setEntries([]); // Clear entries on error for initial load
    } finally {
      if (page === 0) {
        setLoading(false);
      }
      setIsFetchingMore(false);
    }
  }, [user?.id]); // Added user.id to dependencies

  useEffect(() => {
    // Initial fetch or refetch when user changes
    setCurrentPage(0); // Reset page on user change
    setHasMoreEntries(true); // Assume more entries on user change
    fetchEntries(0, searchQuery);
  }, [user?.id, fetchEntries]); // Removed searchQuery from here to avoid re-fetching on every keystroke initially
  
  // Effect for handling search query changes with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (user?.id) { // Only search if user is available
        setCurrentPage(0); // Reset page for new search
        setEntries([]); // Clear existing entries before new search
        setHasMoreEntries(true); // Reset for new search
        fetchEntries(0, searchQuery);
      }
    }, 500); // Debounce search by 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, user?.id, fetchEntries]); // Added user.id and fetchEntries

  // Debug logging
  console.debug('[JournalingHistoryScreen] Rendering with state:', { loading, error, entryCount: entries.length, currentPage, hasMoreEntries, searchQuery });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error('[JournalingHistoryScreen] Error formatting date:', dateString, e);
      return dateString; // fallback to original string if formatting fails
    }
  };

  const renderEntryItem = ({ item }) => (
    <Card style={styles.entryCard}>
      <Card.Content style={styles.cardContentComponent}>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        <Paragraph style={styles.contentText}>{item.content}</Paragraph>
        {item.insights && (
          <View style={styles.insightsContainer}>
            <Title style={styles.insightsTitle}>AI Insight:</Title>
            <Paragraph style={styles.insightsText}>{item.insights}</Paragraph>
          </View>
        )}
         {item.ai_metadata?.prompt_info?.type && (
          <Text style={styles.promptTypeText}>Focus: {item.ai_metadata.prompt_info.type.replace('_', ' ')}</Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderContent = () => {
    if (loading && entries.length === 0) { // Show full loader only if no entries are displayed yet
      return <ActivityIndicator animating={true} color={COLORS.primary} size="large" style={styles.loader} />;
    }
    if (error && entries.length === 0) { // Show error only if no entries are displayed
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (entries.length === 0 && !loading && !searchQuery) { // Adjusted condition for no entries placeholder
      return <Text style={styles.placeholderText}>No journal entries found. Start journaling to see your history!</Text>;
    }
    if (entries.length === 0 && !loading && searchQuery) {
      return <Text style={styles.placeholderText}>No entries found for "{searchQuery}".</Text>;
    }
    return (
      <FlatList
        data={entries}
        renderItem={renderEntryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    );
  };

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMoreEntries && !loading) {
      console.debug('[JournalingHistoryScreen] Loading more entries, current page:', currentPage);
      const nextPage = currentPage + 1;
      fetchEntries(nextPage, searchQuery);
      setCurrentPage(nextPage);
    }
  };

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <ActivityIndicator
        style={{ marginVertical: SPACING.md }}
        animating size="large"
        color={COLORS.primary}
      />
    );
  };
  
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Appbar.Header style={styles.appbar} statusBarHeight={0}>
          <Appbar.BackAction 
            onPress={async () => {
              console.debug('[JournalingHistoryScreen] Back button pressed');
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }} 
            color={COLORS.text} 
          />
          <Appbar.Content 
            title="Journaling History" 
            titleStyle={styles.appbarTitle} 
          />
        </Appbar.Header>
        <Searchbar
          placeholder="Search journal entries..."
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.pinkGradient.start}
          inputStyle={{ color: COLORS.text }}
          placeholderTextColor={COLORS.textLight}
          elevation={1}
        />
        <View style={styles.content}>
          {renderContent()}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  appbar: {
    backgroundColor: COLORS.background,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  appbarTitle: {
    color: COLORS.text,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  content: {
    flex: 1,
    // Removed justifyContent and alignItems to allow FlatList to fill space
    paddingHorizontal: SPACING.md, // Add horizontal padding for the list
    paddingTop: SPACING.sm,
  },
  listContentContainer: {
    paddingBottom: SPACING.lg, // Padding at the bottom of the list
  },
  entryCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  dateText: {
    fontSize: FONT.size.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
    fontFamily: FONT.family.italic, // Using an italic font if available in theme
  },
  contentText: {
    fontSize: FONT.size.sm,
    color: COLORS.text,
    lineHeight: FONT.size.sm * 1.5,
    marginBottom: SPACING.sm,
  },
  insightsContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  insightsTitle: {
    fontSize: FONT.size.sm, // Adjusted for consistency
    fontWeight: FONT.weight.semiBold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  insightsText: {
    fontSize: FONT.size.xs,
    color: COLORS.text,
    lineHeight: FONT.size.xs * 1.6,
    fontStyle: 'italic',
  },
  promptTypeText: {
    fontSize: FONT.size.xs,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
    textAlign: 'right',
    paddingHorizontal: SPACING.lg,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    marginTop: SPACING.xl,
    fontSize: FONT.size.md,
    color: COLORS.error,
    paddingHorizontal: SPACING.lg,
  },
  placeholderText: {
    flex: 1,
    textAlign: 'center',
    marginTop: SPACING.xl,
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    paddingHorizontal: SPACING.lg,
  },
  cardContentComponent: {
    paddingVertical: SPACING.sm, 
    paddingHorizontal: SPACING.sm,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
  },
  searchbar: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs, // Added small margin below searchbar
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface, // Match card background
  },
});

export default JournalingHistoryScreen; 