import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

// Mock farmer data
const mockFarmers = [
  {
    id: '1',
    name: 'Green Valley Organics',
    location: '123 Farm Road, Eco City',
    distance: '2.3 miles',
    products: ['Organic Apples', 'Heirloom Tomatoes', 'Free-Range Eggs'],
    rating: 4.8,
    contact: '+1 (555) 123-4567',
  },
  {
    id: '2',
    name: 'Sunny Fields Farm',
    location: '456 Harvest Lane, Green Town',
    distance: '5.1 miles',
    products: ['Artisanal Cheese', 'Fresh Berries', 'Honey'],
    rating: 4.9,
    contact: '+1 (555) 987-6543',
  },
  {
    id: '3',
    name: 'Mountain Creek Produce',
    location: '789 Orchard Way, Fresh Valley',
    distance: '8.7 miles',
    products: ['Leafy Greens', 'Root Vegetables', 'Herbs'],
    rating: 4.7,
    contact: '+1 (555) 456-7890',
  },
];

export default function FindFarmerScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', title: 'All Farmers' },
    { id: 'organic', title: 'Organic' },
    { id: 'dairy', title: 'Dairy' },
    { id: 'produce', title: 'Produce' },
    { id: 'meat', title: 'Meat' },
  ];

  // Filter farmers based on search and category
  const filteredFarmers = mockFarmers.filter(farmer => {
    // Search filter
    const matchesSearch = !searchQuery || 
      farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    let matchesCategory = true;
    if (selectedCategory === 'organic') {
      matchesCategory = farmer.products.some(p => p.toLowerCase().includes('organic'));
    } else if (selectedCategory === 'dairy') {
      matchesCategory = farmer.products.some(p => 
        p.toLowerCase().includes('cheese') || 
        p.toLowerCase().includes('milk') || 
        p.toLowerCase().includes('eggs')
      );
    } else if (selectedCategory === 'produce') {
      matchesCategory = farmer.products.some(p => 
        p.toLowerCase().includes('vegetable') || 
        p.toLowerCase().includes('fruit') || 
        p.toLowerCase().includes('greens') ||
        p.toLowerCase().includes('tomato') ||
        p.toLowerCase().includes('apple') ||
        p.toLowerCase().includes('berry')
      );
    } else if (selectedCategory === 'meat') {
      matchesCategory = farmer.products.some(p => 
        p.toLowerCase().includes('meat') || 
        p.toLowerCase().includes('chicken')
      );
    }
    
    return matchesSearch && matchesCategory;
  });

  const handleCall = (phoneNumber) => {
    Alert.alert('Call Farmer', `Calling ${phoneNumber}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => {} }
    ]);
  };

  const goBack = () => {
    if (navigation.goBack) {
      navigation.goBack();
    } else {
      Alert.alert('Navigation', 'Going back to previous screen');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#f8fafc"
      />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backIcon}>← </Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find Local Farmers</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Search Section */}
          <View style={styles.searchSection}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search farmers or products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Category Filter */}
          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryList}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category.id && styles.categoryChipSelected,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === category.id && styles.categoryTextSelected,
                      ]}
                    >
                      {category.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Results Count */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {filteredFarmers.length} Local Farmers Found
            </Text>
          </View>

          {/* Farmers List */}
          {filteredFarmers.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No farmers match your search</Text>
            </View>
          ) : (
            filteredFarmers.map((farmer) => (
              <View key={farmer.id} style={styles.farmerCard}>
                <View style={styles.farmerHeader}>
                  <Text style={styles.farmerName}>{farmer.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {farmer.rating}</Text>
                  </View>
                </View>
                
                <Text style={styles.farmerLocation}>{farmer.location}</Text>
                <Text style={styles.farmerDistance}>{farmer.distance}</Text>
                
                <View style={styles.productsContainer}>
                  {farmer.products.map((product, index) => (
                    <Text key={index} style={styles.productTag}>{product}</Text>
                  ))}
                </View>
                
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Contact:</Text>
                  <TouchableOpacity onPress={() => handleCall(farmer.contact)}>
                    <Text style={styles.contactNumber}>{farmer.contact}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#10B981',
  },
  backText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerPlaceholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  categoryContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  categoryList: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  categoryChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  resultsHeader: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  noResults: {
    alignItems: 'center',
    marginTop: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6b7280',
  },
  farmerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  farmerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  farmerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  farmerLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  farmerDistance: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 14,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  productTag: {
    backgroundColor: '#f1f5f9',
    color: '#374151',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  contactNumber: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
});