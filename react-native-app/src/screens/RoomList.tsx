import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { ArrowLeft, DoorOpen, ChevronRight, Plus, FileText, LayoutGrid, Edit2, Trash2, X } from 'lucide-react-native';

export const RoomList = ({ route, navigation }) => {
  const { floorId, floorName } = route.params;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Bedroom');

  const ROOM_TYPES = ['Bedroom', 'Kitchen', 'Living Room', 'Office', 'Bathroom', 'Balcony', 'Other'];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      // In a real app, this would be your API URL
      const response = await fetch(`https://YOUR_API_URL/api/floors/${floorId}/rooms`);
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error(error);
      // Fallback for demo
      setRooms([
        { id: 1, name: 'Master Bedroom', type: 'Bedroom', board_count: 3 },
        { id: 2, name: 'Living Room', type: 'Living', board_count: 5 },
        { id: 3, name: 'Kitchen', type: 'Kitchen', board_count: 2 },
        { id: 4, name: 'Guest Room', type: 'Bedroom', board_count: 2 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!newName.trim()) return;
    
    if (editingRoom) {
      setRooms(rooms.map(r => r.id === editingRoom.id ? { ...r, name: newName, type: newType } : r));
    } else {
      setRooms([...rooms, { id: Date.now(), name: newName, type: newType, board_count: 0 }]);
    }
    
    setModalVisible(false);
    setEditingRoom(null);
    setNewName('');
    setNewType('Bedroom');
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Room",
      "Are you sure you want to delete this room? All electrical data will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => setRooms(rooms.filter(r => r.id !== id))
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
          <Text style={styles.headerTitle}>{floorName}</Text>
          <Text style={styles.headerSubtitle}>Room Selection</Text>
        </View>
        <TouchableOpacity style={styles.reportButton}>
          <FileText color="#6366f1" size={24} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      ) : (
        <FlatList 
          data={rooms}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <TouchableOpacity 
                style={styles.card}
                onPress={() => navigation.navigate('RoomDetail', { roomId: item.id, roomName: item.name })}
              >
                <View style={styles.cardIcon}>
                  <DoorOpen color="#6366f1" size={24} />
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.type}</Text>
                <View style={styles.boardBadge}>
                  <LayoutGrid size={10} color="#6366f1" />
                  <Text style={styles.boardBadgeText}>{item.board_count} Boards</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  onPress={() => {
                    setEditingRoom(item);
                    setNewName(item.name);
                    setNewType(item.type);
                    setModalVisible(true);
                  }}
                  style={styles.actionButton}
                >
                  <Edit2 size={12} color="#6366f1" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDelete(item.id)}
                  style={[styles.actionButton, styles.deleteButton]}
                >
                  <Trash2 size={12} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          setEditingRoom(null);
          setNewName('');
          setNewType('Bedroom');
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
              <Text style={styles.modalTitle}>{editingRoom ? 'Edit Room' : 'New Room'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Room Name</Text>
              <TextInput 
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. Master Bedroom"
              />

              <Text style={styles.label}>Room Type</Text>
              <View style={styles.typeContainer}>
                {ROOM_TYPES.map(type => (
                  <TouchableOpacity 
                    key={type}
                    onPress={() => setNewType(type)}
                    style={[
                      styles.typeChip,
                      newType === type && styles.typeChipActive
                    ]}
                  >
                    <Text style={[
                      styles.typeChipText,
                      newType === type && styles.typeChipTextActive
                    ]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{editingRoom ? 'Update Room' : 'Create Room'}</Text>
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
    padding: 16,
  },
  cardWrapper: {
    flex: 1,
    margin: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -12,
    gap: 8,
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 8,
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
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeChipActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  typeChipText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  typeChipTextActive: {
    color: '#6366f1',
    fontWeight: 'bold',
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
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  boardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
    gap: 4,
  },
  boardBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
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
