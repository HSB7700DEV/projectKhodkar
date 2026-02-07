import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { addUser } from '../database/db';

export const AddPerson = () => {
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [resp, setResp] = useState('');

  const handleSave = () => {
    if (fName && lName && resp) {
      addUser(fName, lName, resp);
      Alert.alert("ثبت شد", "فرد جدید با موفقیت اضافه شد.");
      setFName(''); setLName(''); setResp('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>نام:</Text>
      <TextInput style={styles.input} value={fName} onChangeText={setFName} />
      <Text style={styles.label}>نام خانوادگی:</Text>
      <TextInput style={styles.input} value={lName} onChangeText={setLName} />
      <Text style={styles.label}>مسئولیت:</Text>
      <TextInput style={styles.input} value={resp} onChangeText={setResp} />
      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>ذخیره در سیستم</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 40 },
  label: { fontSize: 18, marginBottom: 5, textAlign: 'right' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 20, textAlign: 'right', fontSize: 18, borderWidth: 1, borderColor: '#ccc' },
  btn: { backgroundColor: '#2ecc71', padding: 20, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});
