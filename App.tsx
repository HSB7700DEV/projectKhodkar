import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { initDB, addUser, getUsersFromDB, User, saveAttendanceReport, getHistoryFromDB, AttendanceRecord, updateUser, deleteUser } from './database';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'manage' | 'settings'>('home');
  const [users, setUsers] = useState<User[]>([]);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showReport, setShowReport] = useState(false);

  // وضعیت‌های مربوط به ویرایش و فرم
  const [editingUser, setEditingUser] = useState<User | null>(null);
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

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFName(user.firstName);
    setLName(user.lastName);
    setResp(user.responsibility);
  };

  const handleUpdate = () => {
    if (editingUser && fName && lName && resp) {
      updateUser(editingUser.id, fName, lName, resp);
      setEditingUser(null);
      loadData();
      Alert.alert("بروزرسانی", "اطلاعات با موفقیت تغییر کرد.");
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("حذف کاربر", "آیا از حذف این فرد اطمینان دارید؟", [
      { text: "خیر" },
      { text: "بله", onPress: () => { deleteUser(id); loadData(); setEditingUser(null); } }
    ]);
  };

  const renderContent = () => {
    // ۱. صفحه اصلی: اخذ آمار
    if (activeTab === 'home') {
      return (
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>پنل اخذ آمار روزانه</Text>
          <FlatList
            data={users}
            numColumns={3}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isPresent = selectedIds.includes(item.id);
              return (
                <TouchableOpacity 
                  onPress={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} 
                  style={[styles.card, isPresent && styles.selectedCard]}>
                  <Text style={[styles.nameText, isPresent && styles.whiteText]}>{item.lastName} {item.firstName}</Text>
                  <Text style={[styles.respText, isPresent && styles.whiteText]}>{item.responsibility}</Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>ابتدا از بخش مدیریت، نفرات را اضافه کنید.</Text>}
            ListFooterComponent={users.length > 0 ? <TouchableOpacity style={styles.finishBtn} onPress={() => { saveAttendanceReport(selectedIds, users); setShowReport(true); loadData(); }}><Text style={styles.whiteBtnText}>تایید و ثبت نهایی</Text></TouchableOpacity> : null}
          />
        </View>
      );
    }

    // ۲. صفحه مدیریت: ویرایش و افزودن
    if (activeTab === 'manage') {
      return (
        <ScrollView style={styles.containerPadding}>
          <Text style={styles.headerTitle}>مدیریت نفرات</Text>
          <View style={styles.addSection}>
            <TextInput placeholder="نام جدید" style={styles.input} value={fName} onChangeText={setFName} />
            <TextInput placeholder="نام خانوادگی جدید" style={styles.input} value={lName} onChangeText={setLName} />
            <TextInput placeholder="مسئولیت" style={styles.input} value={resp} onChangeText={setResp} />
            <TouchableOpacity style={styles.saveBtn} onPress={() => { addUser(fName, lName, resp); setFName(''); setLName(''); setResp(''); loadData(); }}>
              <Text style={styles.whiteBtnText}>➕ افزودن به لیست</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subTitle}>لیست جهت ویرایش (روی نام کلیک کنید):</Text>
          {users.map((user) => (
            <TouchableOpacity key={user.id} style={styles.editRow} onPress={() => openEditModal(user)}>
              <Text style={styles.editText}>✏️ {user.lastName} {user.firstName}</Text>
              <Text style={styles.editResp}>{user.responsibility}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    }

    // ۳. صفحه تنظیمات: تاریخچه
    if (activeTab === 'settings') {
      return (
        <ScrollView style={styles.containerPadding}>
          <Text style={styles.headerTitle}>سوابق آمارگیری</Text>
          {history.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.cell, {color: item.status === 'حاضر' ? '#27ae60' : '#e74c3c'}]}>{item.status}</Text>
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

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => setActiveTab('home')} style={styles.navItem}>
            <Text style={[styles.navIcon, activeTab === 'home' && styles.activeIcon]}>📋</Text>
            <Text style={[styles.navLabel, activeTab === 'home' && styles.activeLabel]}>آمارگیری</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setActiveTab('manage')} style={styles.navItem}>
            <Text style={[styles.navIcon, activeTab === 'manage' && styles.activeIcon]}>👥</Text>
            <Text style={[styles.navLabel, activeTab === 'manage' && styles.activeLabel]}>مدیریت</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab('settings')} style={styles.navItem}>
            <Text style={[styles.navIcon, activeTab === 'settings' && styles.activeIcon]}>📜</Text>
            <Text style={[styles.navLabel, activeTab === 'settings' && styles.activeLabel]}>سوابق</Text>
          </TouchableOpacity>
        </View>

        {/* مودال ویرایش اطلاعات */}
        <Modal visible={editingUser !== null} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.editModalBody}>
              <Text style={styles.modalTitle}>ویرایش اطلاعات</Text>
              <TextInput style={styles.input} value={fName} onChangeText={setFName} placeholder="نام" />
              <TextInput style={styles.input} value={lName} onChangeText={setLName} placeholder="نام خانوادگی" />
              <TextInput style={styles.input} value={resp} onChangeText={setResp} placeholder="مسئولیت" />
              
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                <Text style={styles.whiteBtnText}>ذخیره تغییرات</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.saveBtn, {backgroundColor: '#e74c3c', marginTop: 10}]} onPress={() => handleDelete(editingUser!.id)}>
                <Text style={styles.whiteBtnText}>حذف این فرد</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} onPress={() => setEditingUser(null)}>
                <Text style={styles.whiteBtnText}>انصراف</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* مودال گزارش نهایی */}
        <Modal visible={showReport} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>گزارش نهایی</Text>
              <View style={styles.row}><Text style={styles.val}>{selectedIds.length}</Text><Text style={styles.lbl}>حاضرین:</Text></View>
              <View style={styles.row}><Text style={[styles.val, {color: 'red'}]}>{users.length - selectedIds.length}</Text><Text style={styles.lbl}>غایبین:</Text></View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => { setShowReport(false); setSelectedIds([]); setActiveTab('settings'); }}>
                <Text style={styles.whiteBtnText}>تایید</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6' },
  containerPadding: { padding: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 15, color: '#2c3e50' },
  
  bottomNav: { flexDirection: 'row', height: 75, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', paddingBottom: 5 },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navIcon: { fontSize: 22, color: '#bdc3c7' },
  activeIcon: { color: '#2980b9' },
  navLabel: { fontSize: 11, color: '#bdc3c7', marginTop: 3 },
  activeLabel: { color: '#2980b9', fontWeight: 'bold' },

  card: { flex: 1/3, margin: 8, padding: 25, backgroundColor: '#fff', borderRadius: 15, alignItems: 'center', elevation: 3, minHeight: 110 },
  selectedCard: { backgroundColor: '#2ecc71' },
  nameText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  respText: { fontSize: 13, color: '#7f8c8d', marginTop: 5 },
  whiteText: { color: '#fff' },

  addSection: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 25, elevation: 2 },
  subTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'right' },
  editRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 10, elevation: 1 },
  editText: { fontSize: 16, fontWeight: 'bold', color: '#34495e' },
  editResp: { color: '#95a5a6' },

  input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 12, textAlign: 'right', borderWidth: 1, borderColor: '#ddd' },
  saveBtn: { backgroundColor: '#27ae60', padding: 15, borderRadius: 10, alignItems: 'center' },
  finishBtn: { backgroundColor: '#2980b9', padding: 20, borderRadius: 12, margin: 20, alignItems: 'center' },
  whiteBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  tableRow: { flexDirection: 'row-reverse', padding: 15, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff', marginBottom: 5 },
  cell: { flex: 1, textAlign: 'center', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBody: { width: '60%', backgroundColor: '#fff', padding: 35, borderRadius: 20 },
  editModalBody: { width: '80%', backgroundColor: '#fff', padding: 30, borderRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 25 },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 15 },
  lbl: { fontSize: 16 },
  val: { fontSize: 18, fontWeight: 'bold', color: '#27ae60' },
  closeBtn: { backgroundColor: '#34495e', padding: 15, borderRadius: 10, marginTop: 15, alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#95a5a6' }
});
