import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Camera, FileText, X, Cpu, Zap, ToggleRight, Plug2, Fan, Snowflake, Smartphone, Sun, Search, CheckCircle2, Edit2, Trash2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Shared component types from web version
const COMPONENT_TYPES = [
  { id: "1_way_switch", label: "1-Way Switch", icon: ToggleRight, category: "Switches" },
  { id: "2_way_switch", label: "2-Way Switch", icon: ToggleRight, category: "Switches" },
  { id: "bell_push_switch", label: "Bell Push Switch", icon: Zap, category: "Switches" },
  { id: "5a_socket", label: "5A Socket", icon: Plug2, category: "Sockets" },
  { id: "15a_socket", label: "15A Socket", icon: Plug2, category: "Sockets" },
  { id: "fan_regulator", label: "Fan Regulator", icon: Fan, category: "Regulators" },
  { id: "ac_switch", label: "AC Switch", icon: Snowflake, category: "Switches" },
  { id: "smart_wifi_switch", label: "Smart WiFi Switch", icon: Smartphone, category: "Smart" },
  { id: "dimmer_switch", label: "Dimmer Switch", icon: Sun, category: "Switches" },
];

export const RoomDetail = ({ route, navigation }) => {
  const { roomId, roomName } = route.params;
  const [boards, setBoards] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [isAIActive, setIsAIActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newBoard, setNewBoard] = useState({
    board_number: '',
    wall_position: 'North',
    components: []
  });

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await fetch(`https://ais-dev-meuehu4hqz4z4zkwipb2y3-586792953856.asia-southeast1.run.app/api/rooms/${roomId}/boards`);
        if (!response.ok) {
          const text = await response.text();
          console.error('Fetch boards error:', response.status, text);
          throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        setBoards(data);
      } catch (err) {
        console.error("Fetch boards error:", err);
        Alert.alert('Error', 'Failed to load boards');
      }
    };
    fetchBoards();
  }, [roomId]);

  // AI Detection
  const handleAIScan = async () => {
    setIsDetecting(true);
    
    try {
      // In a real React Native app, we would use react-native-image-picker or camera
      // For this demo, we'll simulate the image capture and send a mock image to the real AI backend
      // to demonstrate the integration.
      
      // Mocking a base64 image for demonstration purposes if no real camera is available
      // In production, this would be the URI from the camera
      const mockImageUri = 'https://picsum.photos/seed/board/800/600';
      
      const formData = new FormData();
      // @ts-ignore
      formData.append('image', {
        uri: mockImageUri,
        type: 'image/jpeg',
        name: 'board.jpg',
      });

      const response = await fetch('https://ais-dev-meuehu4hqz4z4zkwipb2y3-586792953856.asia-southeast1.run.app/api/detect-components', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) throw new Error('Detection failed');
      
      const data = await response.json();
      
      if (data.components) {
        setNewBoard({
          ...newBoard,
          board_number: `B${boards.length + 1}`,
          components: data.components
        });
        setIsAIActive(false);
        setIsAdding(true);
        setEditingBoard(null);
      } else {
        throw new Error('No components detected');
      }
    } catch (error) {
      console.error("AI Detection Error:", error);
      Alert.alert("Detection Failed", "Could not analyze the image. Please try manual entry.");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSaveBoard = async () => {
    if (!newBoard.board_number) {
      Alert.alert("Error", "Please enter a board number");
      return;
    }
    
    try {
      if (editingBoard) {
        const res = await fetch(`https://ais-dev-meuehu4hqz4z4zkwipb2y3-586792953856.asia-southeast1.run.app/api/boards/${editingBoard.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBoard)
        });
        if (!res.ok) throw new Error("Update failed");
        setBoards(boards.map(b => b.id === editingBoard.id ? { ...newBoard, id: b.id } : b));
      } else {
        const res = await fetch(`https://ais-dev-meuehu4hqz4z4zkwipb2y3-586792953856.asia-southeast1.run.app/api/rooms/${roomId}/boards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBoard)
        });
        if (!res.ok) throw new Error("Save failed");
        const data = await res.json();
        setBoards([...boards, { ...newBoard, id: data.id }]);
      }
      
      setIsAdding(false);
      setEditingBoard(null);
      setNewBoard({ board_number: '', wall_position: 'North', components: [] });
    } catch (error) {
      console.error("Save board error:", error);
      Alert.alert("Error", "Failed to save board");
    }
  };

  const handleDeleteBoard = (id) => {
    Alert.alert(
      "Delete Board",
      "Are you sure you want to delete this board?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`https://ais-dev-meuehu4hqz4z4zkwipb2y3-586792953856.asia-southeast1.run.app/api/boards/${id}`, {
                method: "DELETE"
              });
              if (!res.ok) throw new Error("Delete failed");
              setBoards(boards.filter(b => b.id !== id));
            } catch (error) {
              console.error("Delete board error:", error);
              Alert.alert("Error", "Failed to delete board");
            }
          }
        }
      ]
    );
  };

  const updateComponentCount = (typeId, delta) => {
    const existing = newBoard.components.find(c => c.type === typeId);
    if (existing) {
      const newCount = existing.count + delta;
      if (newCount <= 0) {
        setNewBoard({
          ...newBoard,
          components: newBoard.components.filter(c => c.type !== typeId)
        });
      } else {
        setNewBoard({
          ...newBoard,
          components: newBoard.components.map(c => c.type === typeId ? { ...c, count: newCount } : c)
        });
      }
    } else if (delta > 0) {
      setNewBoard({
        ...newBoard,
        components: [...newBoard.components, { type: typeId, count: 1 }]
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{roomName}</Text>
          <Text style={styles.headerSubtitle}>Electrical Mapping</Text>
        </View>
        <TouchableOpacity style={styles.reportButton}>
          <FileText color="#6366f1" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.primaryAction} 
            onPress={() => {
              setEditingBoard(null);
              setNewBoard({ board_number: '', wall_position: 'North', components: [] });
              setIsAdding(true);
            }}
          >
            <Plus color="#fff" size={20} />
            <Text style={styles.primaryActionText}>Manual Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={() => setIsAIActive(true)}>
            <Camera color="#6366f1" size={20} />
            <Text style={styles.secondaryActionText}>AI Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Boards List */}
        <Text style={styles.sectionTitle}>Mapped Boards ({boards.length})</Text>
        {boards.length === 0 ? (
          <View style={styles.emptyState}>
            <Zap color="#cbd5e1" size={48} />
            <Text style={styles.emptyStateText}>No boards mapped yet</Text>
            <Text style={styles.emptyStateSub}>Use AI Scan to detect components instantly</Text>
          </View>
        ) : (
          boards.map(board => (
            <View key={board.id} style={styles.boardCard}>
              <View style={styles.boardHeader}>
                <View style={styles.boardInfo}>
                  <Text style={styles.boardNumber}>Board {board.board_number}</Text>
                  <Text style={styles.boardWall}>{board.wall_position} Wall</Text>
                </View>
                <View style={styles.boardActions}>
                  <TouchableOpacity 
                    onPress={() => {
                      setEditingBoard(board);
                      setNewBoard({ ...board });
                      setIsAdding(true);
                    }}
                    style={styles.boardActionButton}
                  >
                    <Edit2 color="#6366f1" size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDeleteBoard(board.id)}
                    style={[styles.boardActionButton, styles.boardDeleteButton]}
                  >
                    <Trash2 color="#ef4444" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.componentGrid}>
                {board.components.map((comp, idx) => {
                  const typeInfo = COMPONENT_TYPES.find(t => t.id === comp.type);
                  const Icon = typeInfo?.icon || Zap;
                  return (
                    <View key={idx} style={styles.componentBadge}>
                      <Icon color="#6366f1" size={14} />
                      <Text style={styles.componentLabel}>{typeInfo?.label || comp.type}</Text>
                      <Text style={styles.componentCount}>{comp.count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Manual Add Modal */}
      <Modal visible={isAdding} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingBoard ? 'Edit Board' : 'Add Board'}</Text>
              <TouchableOpacity onPress={() => setIsAdding(false)}>
                <X color="#0f172a" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Board #</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="e.g. B1"
                  value={newBoard.board_number}
                  onChangeText={text => setNewBoard({...newBoard, board_number: text})}
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Wall</Text>
                <View style={styles.wallPicker}>
                  {['North', 'South', 'East', 'West'].map(pos => (
                    <TouchableOpacity 
                      key={pos}
                      onPress={() => setNewBoard({...newBoard, wall_position: pos})}
                      style={[
                        styles.wallChip,
                        newBoard.wall_position === pos && styles.wallChipActive
                      ]}
                    >
                      <Text style={[
                        styles.wallChipText,
                        newBoard.wall_position === pos && styles.wallChipTextActive
                      ]}>{pos[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.componentSelectSection}>
              <View style={styles.componentHeader}>
                <Text style={styles.label}>Select Components</Text>
                <View style={styles.miniSearch}>
                  <Search color="#94a3b8" size={14} />
                  <TextInput 
                    style={styles.miniSearchInput}
                    placeholder="Search..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                  />
                </View>
              </View>

              <ScrollView style={styles.componentList}>
                <View style={styles.componentGridSelect}>
                  {COMPONENT_TYPES.filter(t => t.label.toLowerCase().includes(searchTerm.toLowerCase())).map(type => {
                    const existing = newBoard.components.find(c => c.type === type.id);
                    return (
                      <View key={type.id} style={[styles.typeItem, existing && styles.typeItemActive]}>
                        <type.icon color={existing ? "#6366f1" : "#94a3b8"} size={18} />
                        <Text style={[styles.typeLabel, existing && styles.typeLabelActive]} numberOfLines={1}>{type.label}</Text>
                        
                        <View style={styles.counter}>
                          <TouchableOpacity 
                            onPress={() => updateComponentCount(type.id, -1)}
                            style={styles.counterBtn}
                          >
                            <Text style={styles.counterBtnText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.counterVal}>{existing ? existing.count : 0}</Text>
                          <TouchableOpacity 
                            onPress={() => updateComponentCount(type.id, 1)}
                            style={styles.counterBtn}
                          >
                            <Text style={styles.counterBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveBoard}>
              <Text style={styles.saveButtonText}>{editingBoard ? 'Update Board' : 'Save Board'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AI Scanner Modal (Simulated) */}
      <Modal visible={isAIActive} animationType="fade">
        <View style={styles.scannerContainer}>
          <View style={styles.cameraPreview}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.tl]} />
              <View style={[styles.corner, styles.tr]} />
              <View style={[styles.corner, styles.bl]} />
              <View style={[styles.corner, styles.br]} />
              {isDetecting && <View style={styles.scanLine} />}
            </View>
            <TouchableOpacity style={styles.closeScanner} onPress={() => setIsAIActive(false)}>
              <X color="#fff" size={32} />
            </TouchableOpacity>
          </View>
          <View style={styles.scannerControls}>
            {isDetecting ? (
              <View style={styles.detectingState}>
                <ActivityIndicator color="#6366f1" size="large" />
                <Text style={styles.detectingText}>AI Analyzing Board...</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.captureButton} onPress={handleAIScan}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
            )}
            <Text style={styles.scannerHint}>Align the board within the frame</Text>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#6366f1',
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#eef2ff',
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  secondaryActionText: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 16,
  },
  emptyStateSub: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  boardCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  boardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  boardActionButton: {
    padding: 4,
  },
  boardDeleteButton: {
    opacity: 0.8,
  },
  boardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  boardWall: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  componentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  componentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 6,
  },
  componentLabel: {
    fontSize: 11,
    fontWeight: 'medium',
    color: '#475569',
  },
  componentCount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    borderRadius: 4,
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  inputGroup: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  inputHalf: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    height: 50,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  wallPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  wallChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  wallChipActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  wallChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  wallChipTextActive: {
    color: '#6366f1',
  },
  pickerContainer: {
    backgroundColor: '#f8fafc',
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pickerText: {
    fontSize: 16,
    color: '#0f172a',
  },
  componentSelectSection: {
    flex: 1,
    marginBottom: 24,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  miniSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    borderRadius: 10,
    width: 120,
    height: 32,
  },
  miniSearchInput: {
    flex: 1,
    fontSize: 12,
    marginLeft: 6,
    color: '#0f172a',
  },
  componentList: {
    maxHeight: 300,
  },
  componentGridSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeItem: {
    width: (width - 64) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  typeItemActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#c7d2fe',
  },
  typeLabel: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
  },
  typeLabelActive: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  counterBtn: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
  counterVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    minWidth: 12,
    textAlign: 'center',
  },
  countBadge: {
    backgroundColor: '#6366f1',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 32,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#6366f1',
  },
  tl: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  tr: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  bl: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  br: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  closeScanner: {
    position: 'absolute',
    top: 60,
    right: 24,
  },
  scannerControls: {
    backgroundColor: '#0f172a',
    padding: 40,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  scannerHint: {
    color: '#94a3b8',
    fontSize: 14,
  },
  detectingState: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detectingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
});
