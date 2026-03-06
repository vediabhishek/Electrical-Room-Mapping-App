import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { Building2, Plus, ChevronRight, Search, MapPin, Edit2, Trash2, X } from 'lucide-react-native';

export const BuildingList = ({ navigation }) => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      // In a real app, this would be your API URL
      const response = await fetch('https://YOUR_API_URL/api/buildings');
      const data = await response.json();
      setBuildings(data);
    } catch (error) {
      console.error(error);
      // Fallback for demo
      setBuildings([
        { id: 1, name: 'Skyline Apartments', address: '123 Tech Avenue', floor_count: 5 },
        { id: 2, name: 'Green Valley Office', address: '456 Innovation Way', floor_count: 3 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newName.trim()) return;
    
    if (editingBuilding) {
      // Update logic
      setBuildings(buildings.map(b => b.id === editingBuilding.id ? { ...b, name: newName, address: newAddress } : b));
    } else {
      // Add logic
      const newB = { id: Date.now(), name: newName, address: newAddress, floor_count: 0 };
      setBuildings([newB, ...buildings]);
    }
    
    setModalVisible(false);
    setEditingBuilding(null);
    setNewName('');
    setNewAddress('');
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Building",
      "Are you sure you want to delete this building? All data will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => setBuildings(buildings.filter(b => b.id !== id))
        }
      ]
    );
  };

  const filteredBuildings = buildings.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buildings</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            setEditingBuilding(null);
            setNewName('');
            setNewAddress('');
            setModalVisible(true);
          }}
        >
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#94a3b8" size={20} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search buildings..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      ) : (
        <FlatList 
          data={filteredBuildings}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <TouchableOpacity 
                style={styles.card}
                onPress={() => navigation.navigate('Floors', { buildingId: item.id, buildingName: item.name })}
              >
                <View style={styles.cardIcon}>
                  <Building2 color="#6366f1" size={24} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.cardMeta}>
                    <MapPin size={12} color="#94a3b8" />
                    <Text style={styles.cardSubtitle}>{item.address}</Text>
                  </View>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.floor_count} Floors</Text>
                </View>
                <ChevronRight color="#cbd5e1" size={20} />
              </TouchableOpacity>
              
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  onPress={() => {
                    setEditingBuilding(item);
                    setNewName(item.name);
                    setNewAddress(item.address);
                    setModalVisible(true);
                  }}
                  style={styles.actionButton}
                >
                  <Edit2 size={16} color="#6366f1" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDelete(item.id)}
                  style={[styles.actionButton, styles.deleteButton]}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingBuilding ? 'Edit Building' : 'New Building'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Building Name</Text>
              <TextInput 
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. Skyline Apartments"
              />

              <Text style={styles.label}>Address</Text>
              <TextInput 
                style={styles.input}
                value={newAddress}
                onChangeText={setNewAddress}
                placeholder="e.g. 123 Tech Avenue"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{editingBuilding ? 'Update Building' : 'Create Building'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  list: {
    padding: 24,
    paddingTop: 0,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: -10,
    marginRight: 16,
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButton: {
    borderColor: '#fee2e2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: -8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});
