import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Layers, ChevronRight, Plus, FileText, Edit2, Trash2, X } from 'lucide-react-native';

export const FloorList = ({ route, navigation }) => {
  const { buildingId, buildingName } = route.params;
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchFloors();
  }, []);

  const fetchFloors = async () => {
    try {
      const response = await fetch(`https://ais-dev-meuehu4hqz4z4zkwipb2y3-586792953856.asia-southeast1.run.app/api/buildings/${buildingId}/floors`);
      if (!response.ok) {
        const text = await response.text();
        console.error('Fetch floors error:', response.status, text);
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      setFloors(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load floors');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newName.trim()) return;
    
    try {
      if (editingFloor) {
        const res = await fetch(`https://ais-dev-meuehu4hqz4z4zkwipb2y3-586792953856.asia-southeast1.run.app/api/floors/${editingFloor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName })
        });
        if (!res.ok) throw new Error('Update failed');
        setFloors(floors.map(f => f.id === editingFloor.id ? { ...f, name: newName } : f));
      } else {
        const res = await fetch(`https://ais-dev-meuehu4hqz4z4zkwipb2y3-586792953856.asia-southeast1.run.app/api/buildings/${buildingId}/floors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName })
        });
        if (!res.ok) throw new Error('Create failed');
        const data = await res.json();
        setFloors([...floors, { ...data, name: newName, room_count: 0 }]);
      }
      
      setModalVisible(false);
      setEditingFloor(null);
      setNewName('');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save floor');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Floor",
      "Are you sure you want to delete this floor? All rooms will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`https://ais-dev-meuehu4hqz4z4zkwipb2y3-586792953856.asia-southeast1.run.app/api/floors/${id}`, {
                method: 'DELETE'
              });
              if (!res.ok) throw new Error('Delete failed');
              setFloors(floors.filter(f => f.id !== id));
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete floor');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{buildingName}</Text>
          <Text style={styles.headerSubtitle}>Floor Selection</Text>
        </View>
        <TouchableOpacity style={styles.reportButton}>
          <FileText color="#6366f1" size={24} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      ) : (
        <FlatList 
          data={floors}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <TouchableOpacity 
                style={styles.card}
                onPress={() => navigation.navigate('Rooms', { floorId: item.id, floorName: item.name })}
              >
                <View style={styles.cardIcon}>
                  <Layers color="#6366f1" size={24} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>{item.room_count} Rooms Mapped</Text>
                </View>
                <ChevronRight color="#cbd5e1" size={20} />
              </TouchableOpacity>
              
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  onPress={() => {
                    setEditingFloor(item);
                    setNewName(item.name);
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

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          setEditingFloor(null);
          setNewName('');
          setModalVisible(true);
        }}
      >
        <Plus color="#fff" size={24} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingFloor ? 'Edit Floor' : 'New Floor'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Floor Name/Number</Text>
              <TextInput 
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. Ground Floor"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{editingFloor ? 'Update Floor' : 'Create Floor'}</Text>
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
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reportButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 24,
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
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});
