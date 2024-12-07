import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import axios from 'axios';

const validateEmail = (email) => /^[0-9]{7}@ub\.edu\.ph$/.test(email);

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleRegister = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid email', 'Please enter a valid UB email address.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Error', 'Passwords do not match.');
      return;
    }

    try {
      console.log('Sending registration request...');
      const response = await axios.post('http://192.168.1.3:3001/register', { email, password });

      if (response.data.success) {
        setIsOtpSent(true);
        Alert.alert('OTP Sent', 'A verification code has been sent to your email.');
      } else {
        Alert.alert('Registration Failed', response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Registration Error', 'Unable to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Invalid OTP', 'Please enter the OTP sent to your email.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.3:3001/verify-otp', { email, otp });

      if (response.data.success) {
        Alert.alert('Registration Complete', 'Your registration is now complete.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Verification Failed', response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Verification Error', 'Unable to verify OTP. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/bmc.png')} style={styles.logo} />
        <Text style={styles.logoText}>University of Batangas</Text>
      </View>

      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your UB Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#aaa"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#aaa"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor="#aaa"
      />

      {isOtpSent && (
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          placeholderTextColor="#aaa"
        />
      )}

      {!isOtpSent ? (
        <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
          <Text style={styles.buttonText}>SEND CODE</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.submitButton} onPress={handleVerifyOtp}>
          <Text style={styles.buttonText}>VERIFY OTP</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.footer}>
          Already have an account? <Text style={styles.link}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#757272' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logo: { width: 40, height: 40, marginRight: 10 },
  logoText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  title: { fontSize: 18, color: '#fff', marginBottom: 20 },
  input: { width: '80%', backgroundColor: '#4D1616', padding: 15, borderRadius: 10, color: '#fff', marginBottom: 10 },
  submitButton: { backgroundColor: '#e63946', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  footer: { marginTop: 20, color: '#ccc' },
  link: { color: '#87ceeb', textDecorationLine: 'underline' },
});

export default RegisterScreen;
