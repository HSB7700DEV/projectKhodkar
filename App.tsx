import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { initDB, addUser, getUsersFromDB, User, saveAttendanceReport, getHistoryFromDB, AttendanceRecord } from './database';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');
  const [settingSubScreen, setSettingSubScreen] = useState<'menu' | 'add' | 'history'>('menu');
  
  const [users, setUsers] = useState<User[]>([]);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showReport, setShowReport] = useState(false);

  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [resp, setResp] = useState('');

  useEffect(() => {
    initDB();
    loadData();
  }, []);

  const loadData = () => {
    const data = getUsersFromDB();
    setUsers(data.sort((a, b) => a.lastName.localeCompare(b.lastName, 'fa')));
    setHistory(getHistoryFromDB());
  };

  const handleFinish = () => {
    if (users.length === 0) return;
    saveAttendanceReport(selectedIds, users);
    setShowReport(true);
    setHistory(getHistoryFromDB());
  };

  // --- رندر صفحات ---
  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <FlatList
          data={users}
          numColumns={3}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isPresent = selectedIds.includes(item.id);
            return (
              <TouchableOpacity onPress={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} 
                style={[styles.card, isPresent && styles.selectedCard]}>
                <Text style={[styles.nameText, isPresent && styles.whiteText]}>{item.lastName} {item.firstName}</Text>
                <Text style={[styles.respText, isPresent && styles.whiteText]}>{item.responsibility}</Text>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={<TouchableOpacity style={styles.finishBtn} onPress={handleFinish}><Text style={styles.whiteBtnText}>اتمام آمار و ثبت</Text></TouchableOpacity>}
        />
      );
    }

    // بخش تنظیمات
    if (settingSubScreen === 'menu') {
      return (
        <View style={styles.settingsMenu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setSettingSubScreen('history')}>
            <Text style={styles.menuText}>مشاهده سوابق و تاریخچه</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setSettingSubScreen('add')}>
            <Text style={styles.menuText}>افزودن فرد جدید</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (settingSubScreen === 'add') {
      return (
        <View style={styles.form}>
          <TouchableOpacity onPress={() => setSettingSubScreen('menu')}><Text style={styles.backLink}>← بازگشت به تنظیمات</Text></TouchableOpacity>
          <Text style={styles.title}>تعریف عضو جدید</Text>
          <TextInput placeholder="نام" style={styles.input} value={fName} onChangeText={setFName} />
          <TextInput placeholder="نام خانوادگی" style={styles.input} value={lName} onChangeText={setLName} />
          <TextInput placeholder="مسئولیت" style={styles.input} value={resp} onChangeText={setResp} />
          <TouchableOpacity style={styles.saveBtn} onPress={() => { addUser(fName, lName, resp); setFName(''); setLName(''); setResp(''); loadData(); setSettingSubScreen('menu'); }}>
            <Text style={styles.whiteBtnText}>ذخیره</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (settingSubScreen === 'history') {
      return (
        <ScrollView style={styles.historyContainer}>
          <TouchableOpacity onPress={() => setSettingSubScreen('menu')}><Text style={styles.backLink}>← بازگشت به تنظیمات</Text></TouchableOpacity>
          <Text style={styles.title}>سوابق آمار</Text>
          {history.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.cell, {color: item.status === 'حاضر' ? 'green' : 'red'}]}>{item.status}</Text>
              <Text style={styles.cell}>{item.date}</Text>
              <Text style={styles.cell}>{item.lastName} {item.firstName}</Text>
            </View>
          ))}
        </ScrollView>
      );
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>{renderContent()}</View>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => { setActiveTab('home'); setSettingSubScreen('menu'); }} style={styles.navItem}>
            <Text style={[styles.navIcon, activeTab === 'home' && styles.activeIcon]}>🏠</Text>
            <Text style={[styles.navLabel, activeTab === 'home' && styles.activeLabel]}>آمارگیری</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setActiveTab('settings')} style={styles.navItem}>
            <Text style={[styles.navIcon, activeTab === 'settings' && styles.activeIcon]}>⚙️</Text>
            <Text style={[styles.navLabel, activeTab === 'settings' && styles.activeLabel]}>تنظیمات</Text>
          </TouchableOpacity>
        </View>

        {/* Modal گزارش */}
        <Modal visible={showReport} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>گزارش نهایی</Text>
              <View style={styles.row}><Text style={styles.val}>{selectedIds.length}</Text><Text style={styles.lbl}>حاضرین:</Text></View>
              <View style={styles.row}><Text style={[styles.val, {color: 'red'}]}>{users.length - selectedIds.length}</Text><Text style={styles.lbl}>غایبین:</Text></View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => { setShowReport(false); setSelectedIds([]); setActiveTab('home'); }}>
                <Text style={styles.whiteBtnText}>تایید و بازگشت</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  // Bottom Nav Styles
  bottomNav: { flexDirection: 'row', height: 80, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', paddingBottom: 10 },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navIcon: { fontSize: 24, color: '#bdc3c7' },
  activeIcon: { color: '#2980b9' },
  navLabel: { fontSize: 12, color: '#bdc3c7', marginTop: 4 },
  activeLabel: { color: '#2980b9', fontWeight: 'bold' },

  // Settings Menu
  settingsMenu: { flex: 1, padding: 40, justifyContent: 'center' },
  menuItem: { backgroundColor: '#fff', padding: 25, borderRadius: 15, marginBottom: 20, alignItems: 'center', elevation: 3, borderWidth: 1, borderColor: '#eee' },
  menuText: { fontSize: 20, fontWeight: '600', color: '#34495e' },
  backLink: { color: '#2980b9', fontSize: 18, marginBottom: 20, textAlign: 'right' },

  card: { flex: 1/3, margin: 10, padding: 30, backgroundColor: '#fff', borderRadius: 15, alignItems: 'center', elevation: 3 },
  selectedCard: { backgroundColor: '#2ecc71' },
  nameText: { fontSize: 18, fontWeight: 'bold' },
  respText: { fontSize: 14, color: '#666' },
  whiteText: { color: '#fff' },
  
  form: { padding: 40 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, textAlign: 'right', borderWidth: 1, borderColor: '#ddd' },
  saveBtn: { backgroundColor: '#27ae60', padding: 15, borderRadius: 10, alignItems: 'center' },
  finishBtn: { backgroundColor: '#2980b9', padding: 25, borderRadius: 12, margin: 20, alignItems: 'center' },
  whiteBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  historyContainer: { padding: 20 },
  tableRow: { flexDirection: 'row-reverse', padding: 15, borderBottomWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  cell: { flex: 1, textAlign: 'center', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBody: { width: '50%', backgroundColor: '#fff', padding: 40, borderRadius: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 15 },
  lbl: { fontSize: 18 },
  val: { fontSize: 22, fontWeight: 'bold', color: 'green' },
  closeBtn: { backgroundColor: '#34495e', padding: 15, borderRadius: 10, marginTop: 20, alignItems: 'center' }
});
