import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { BackIcon, CalendarDownIcon, CalendarUpIcon, SquareCheckIcon, TimerIcon } from '../../../Theme';
import Constants, { FONTS } from '../../Assets/Helpers/constant';

const Notification = () => {

  const bookings = [
    {
      title: 'Order #PDX20458 – Electronics Parcel',
      description: '📦 Your parcel from Sydney to Melbourne has been picked up by the courier.',
    },
    {
      title: 'Order #PDX20461 – Business Documents',
      description: '🚚 Your shipment is in transit from Brisbane to Adelaide. Track progress in real time.',
    },
    {
      title: 'Order #PDX20389 – Documents Envelope',
      description: '📬 Shipment delivered in Sydney. Receiver confirmed successful delivery.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
          <BackIcon height={24} width={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
      data={bookings}
      renderItem={({item}) => (
          <View style={styles.bookingCard}>
                <Text style={styles.routeValue}>{item?.title}</Text>
                <Text style={styles.routeLabel}>{item?.description}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  header: {
    backgroundColor: '#2d5f4f',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    borderBottomLeftRadius:10,
    borderBottomRightRadius:10
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily:FONTS.Medium,
    color: Constants.white,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    width:'90%',
    alignSelf:'center',
    marginTop:15
  },
  routeLabel: {
    color: Constants.customgrey,
    fontSize:12,
    fontFamily:FONTS.Medium
  },
  routeValue: {
    color: Constants.black,
    fontSize:14,
    fontFamily:FONTS.SemiBold
  },
});

export default Notification;