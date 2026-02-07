import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { getAllUsers, User, saveAttendance } from '../database/db';
import { PersonCard } from '../components/PersonCard';

export const Attendance = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const data = getAllUsers();
    const sorted = data.sort((a, b) => a.lastName.localeCompare(b.lastName, 'fa'));
    setUsers(sorted);
  }, []);

  const toggleUser = (id: number) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFinish = () => {
    const records = users.map(u => ({ userId: u.id, status: selected[u.id] ? 'حاضر' : 'غایب' }));
    saveAttendance(records);
    Alert.alert("پایان", "آمار با موفقیت ثبت شد.");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PersonCard 
            user={item} 
            isSelected={!!selected[item.id]} 
            onPress={() => toggleUser(item.id)} 
          />
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.submitBtn} onPress={handleFinish}>
            <Text style={styles.submitBtnText}>اتمام آمار و ثبت در پایگاه داده</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  submitBtn: { backgroundColor: '#34495e', padding: 25, borderRadius: 15, margin: 20, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 22, fontWeight: 'bold' }
});
