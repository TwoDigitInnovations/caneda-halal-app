import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { BackIcon, CalendarDownIcon, CalendarUpIcon, SquareCheckIcon, TimerIcon } from '../../../Theme';
import Constants from '../../Assets/Helpers/constant';

const History = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const bookings = [
    {
      id: 1,
      title: 'Electronics Parcel',
      orderId: 'PDX20458',
      from: 'New York (JFK)',
      to: 'London (LHR)',
      pickupDate: '26 Oct 2025',
      deliveryDate: '26 Oct 2025',
      status: 'Picked Up',
      statusType: 'completed',
    },
    {
      id: 2,
      title: 'Electronics Parcel',
      orderId: 'PDX20458',
      from: 'New York (JFK)',
      to: 'London (LHR)',
      pickupDate: '26 Oct 2025',
      deliveryDate: '26 Oct 2025',
      status: 'In-transit',
      statusType: 'in-progress',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
          <BackIcon height={24} width={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking History</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('pending')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending
          </Text>
          {activeTab === 'pending' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('completed')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed
          </Text>
          {activeTab === 'completed' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('cancelled')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'cancelled' && styles.tabTextActive]}>
            Cancelled
          </Text>
          {activeTab === 'cancelled' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>
      <View style={styles.horline}></View>

      {/* Booking Cards */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {bookings.map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{booking.title}</Text>
              <Text style={styles.orderId}>Order #{booking.orderId}</Text>
            </View>

            {/* Route */}
            <View style={styles.routeContainer}>
              <Text style={styles.routeText}>
                <Text style={styles.routeLabel}>From: </Text>
                <Text style={styles.routeValue}>{booking.from}</Text>
                <Text style={styles.routeArrow}> → </Text>
                <Text style={styles.routeLabel}>To: </Text>
                <Text style={styles.routeValue}>{booking.to}</Text>
              </Text>
            </View>

            {/* Details Row 1 */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <CalendarUpIcon />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Pick up Date: </Text>
                  <Text style={styles.detailValue}>{booking.pickupDate}</Text>
                </Text>
              </View>

              <View style={styles.detailItem}>
                {booking.statusType === 'completed' ? <SquareCheckIcon /> : <TimerIcon />}
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Status: </Text>
                  <Text style={styles.detailValue}>{booking.status}</Text>
                </Text>
              </View>
            </View>

            {/* Details Row 2 */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <CalendarDownIcon />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Exp. Delivery Date: </Text>
                  <Text style={styles.detailValue}>{booking.deliveryDate}</Text>
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
    fontWeight: '600',
    color: '#fff',
  },
  tabContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 20,
    // borderBottomWidth: 1,
    // borderBottomColor: '#e0e0e0',
  },
  tab: {
    marginRight: 24,
    paddingTop: 16,
    paddingBottom: 7,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Constants.dark_green,
    borderRadius: 2,
  },
  horline:{
    height:1,
    backgroundColor:'#f0f0f0',
    marginHorizontal:20,
    marginTop:10
  },
  content: {
    flex: 1,
    padding: 20,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  orderId: {
    fontSize: 12,
    color: '#999',
  },
  routeContainer: {
    marginBottom: 16,
  },
  routeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  routeLabel: {
    color: '#666',
  },
  routeValue: {
    color: '#1a1a1a',
    fontWeight: '500',
  },
  routeArrow: {
    color: '#666',
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
    flexWrap: 'wrap',
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    color: '#1a1a1a',
    fontWeight: '500',
  },
});

export default History;