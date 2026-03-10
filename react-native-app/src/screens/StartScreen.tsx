import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Building2, FileText, Cpu, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export const StartScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Zap color="#fff" size={40} strokeWidth={2.5} />
          </View>
          <Text style={styles.logoText}>VoltMap AI</Text>
          <Text style={styles.tagline}>Professional Electrical Mapping</Text>
        </View>

        {/* Features List */}
        <View style={styles.features}>
          <FeatureItem 
            icon={<Cpu color="#10b981" size={24} />}
            title="AI Board Scanner"
            desc="Detect components instantly using your camera"
          />
          <FeatureItem 
            icon={<Building2 color="#6366f1" size={24} />}
            title="Hierarchical Mapping"
            desc="Organize by Building, Floor, and Room"
          />
          <FeatureItem 
            icon={<FileText color="#f59e0b" size={24} />}
            title="Professional PDF Reports"
            desc="Generate branded reports for your clients"
          />
        </View>

        {/* Bottom Action */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Buildings')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <ChevronRight color="#fff" size={20} />
          </TouchableOpacity>
          <Text style={styles.version}>v2.0 Professional Edition</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const FeatureItem = ({ icon, title, desc }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>{icon}</View>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Slate 900
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
  },
  features: {
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  featureDesc: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 60,
    borderRadius: 20,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  version: {
    color: '#475569',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
