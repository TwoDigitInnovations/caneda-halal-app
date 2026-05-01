import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import Constants, {FONTS} from '../../Assets/Helpers/constant';
import {GetApi} from '../../Assets/Helpers/Service';
import moment from 'moment';

const NotifCard = ({item}) => (
  <View style={s.card}>
    <View style={s.cardTop}>
      <Text style={s.title}>{item.title}</Text>
      <Text style={s.time}>{moment(item.createdAt).fromNow()}</Text>
    </View>
    {item.description ? (
      <Text style={s.body}>{item.description}</Text>
    ) : null}
  </View>
);

const EmptyState = ({loading}) => (
  <View style={s.emptyWrap}>
    {loading ? (
      <ActivityIndicator size="large" color={Constants.dark_green} />
    ) : (
      <>
        <Text style={s.emptyIcon}>🔔</Text>
        <Text style={s.emptyTitle}>No notifications yet</Text>
        <Text style={s.emptySub}>You're all caught up!</Text>
      </>
    )}
  </View>
);

const FlightNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      GetApi('getnotification?type=FLIGHT').then(
        res => {
          setLoading(false);
          const list = res?.data;
          if (Array.isArray(list)) {
            setNotifications(list);
          }
        },
        () => setLoading(false),
      );
    }, []),
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar backgroundColor={Constants.dark_green} barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item._id ?? item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState loading={loading} />}
        renderItem={({item}) => <NotifCard item={item} />}
      />
    </SafeAreaView>
  );
};

export default FlightNotification;

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {
    backgroundColor: Constants.dark_green,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 10,
  },
  backBtn: {padding: 4},
  backArrow: {fontSize: 22, color: Constants.white, fontFamily: FONTS.Bold, lineHeight: 26},
  headerTitle: {fontSize: 20, fontFamily: FONTS.Bold, color: Constants.white},

  list: {padding: 14, gap: 12, paddingBottom: 110},

  card: {
    backgroundColor: Constants.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey3,
    marginTop: 2,
  },
  body: {
    fontSize: 13,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey3,
    lineHeight: 19,
  },

  emptyWrap: {alignItems: 'center', paddingTop: 80, gap: 10},
  emptyIcon: {fontSize: 48},
  emptyTitle: {fontSize: 16, fontFamily: FONTS.SemiBold, color: Constants.black},
  emptySub: {fontSize: 13, fontFamily: FONTS.Regular, color: Constants.customgrey3},
});
