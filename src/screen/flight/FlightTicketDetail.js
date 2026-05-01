import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import {Svg, Path} from 'react-native-svg';
import Constants, {FONTS} from '../../Assets/Helpers/constant';
import {goBack} from '../../../navigationRef';
import moment from 'moment';

/* ── helpers ── */
const fmt = n => Number(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const fmtTime = t => (t ? moment(t).format('HH:mm') : '—');
const fmtDate = t => (t ? moment(t).format('Do MMM YYYY') : '—');
const fmtDuration = mins => {
  if (!mins) {return '—';}
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

const statusColor = status => {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed' || s === 'ticketed') {return '#22c55e';}
  if (s === 'cancelled' || s === 'failed') {return '#ef4444';}
  if (s === 'completed') {return '#3b82f6';}
  return '#9ca3af';
};

const paxTypeLabel = t => (t === 2 ? 'Child' : 'Adult');

/* ── icons ── */
const ArrowRight = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke={Constants.customgrey3}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlaneUp = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.5L13.5 11V4.5C13.5 3.67 12.83 3 12 3C11.17 3 10.5 3.67 10.5 4.5V11L2 16.5V18.5L10.5 16V20L8.5 21.5V23L12 22L15.5 23V21.5L13.5 20V16L22 18.5V16.5Z"
      fill={Constants.dark_green}
    />
  </Svg>
);

/* ── section header ── */
const SectionTitle = ({label}) => (
  <Text style={s.sectionTitle}>{label}</Text>
);

/* ── segment card ── */
const SegmentCard = ({seg, index}) => {
  const dep = seg?.Origin?.DepTime;
  const arr = seg?.Destination?.ArrTime;
  const depAirport = seg?.Origin?.Airport ?? {};
  const arrAirport = seg?.Destination?.Airport ?? {};
  const airline = seg?.Airline ?? {};

  return (
    <View style={s.segCard}>
      <View style={s.segHeader}>
        <Text style={s.segAirline}>
          {airline.AirlineName || '—'}
        </Text>
        <Text style={s.segFlight}>
          {airline.AirlineCode} {airline.FlightNumber}
        </Text>
      </View>

      <View style={s.segRoute}>
        {/* departure */}
        <View style={s.segEndpoint}>
          <Text style={s.segTime}>{fmtTime(dep)}</Text>
          <Text style={s.segCode}>{depAirport.AirportCode || '—'}</Text>
          <Text style={s.segCity} numberOfLines={1}>{depAirport.CityName || depAirport.AirportName || ''}</Text>
          {depAirport.Terminal ? (
            <Text style={s.segTerminal}>Terminal {depAirport.Terminal}</Text>
          ) : null}
          <Text style={s.segDate}>{fmtDate(dep)}</Text>
        </View>

        {/* duration arrow */}
        <View style={s.segMid}>
          <Text style={s.segDuration}>{fmtDuration(seg?.Duration)}</Text>
          <View style={s.segLine} />
          <ArrowRight />
        </View>

        {/* arrival */}
        <View style={[s.segEndpoint, s.segEndpointRight]}>
          <Text style={s.segTime}>{fmtTime(arr)}</Text>
          <Text style={s.segCode}>{arrAirport.AirportCode || '—'}</Text>
          <Text style={s.segCity} numberOfLines={1}>{arrAirport.CityName || arrAirport.AirportName || ''}</Text>
          {arrAirport.Terminal ? (
            <Text style={s.segTerminal}>Terminal {arrAirport.Terminal}</Text>
          ) : null}
          <Text style={s.segDate}>{fmtDate(arr)}</Text>
        </View>
      </View>

      <View style={s.segFooter}>
        {seg?.Baggage ? (
          <Text style={s.segBag}>Check-in: {seg.Baggage}</Text>
        ) : null}
        {seg?.CabinBaggage ? (
          <Text style={s.segBag}>Cabin: {seg.CabinBaggage}</Text>
        ) : null}
        {seg?.Craft ? (
          <Text style={s.segBag}>Aircraft: {seg.Craft}</Text>
        ) : null}
      </View>
    </View>
  );
};

/* ── passenger row ── */
const PassengerRow = ({pax, index}) => (
  <View style={s.paxRow}>
    <View style={s.paxLeft}>
      <Text style={s.paxName}>
        {pax.Title ? `${pax.Title} ` : ''}{pax.FirstName} {pax.LastName}
      </Text>
      <Text style={s.paxMeta}>
        {paxTypeLabel(pax.PaxType)}
        {pax.PassportNo ? `  ·  Passport: ${pax.PassportNo}` : ''}
      </Text>
    </View>
    {pax?.Ticket?.TicketId ? (
      <Text style={s.paxTicket}>#{pax.Ticket.TicketId}</Text>
    ) : null}
  </View>
);

/* ── main screen ── */
const FlightTicketDetail = () => {
  const route = useRoute();
  const {item} = route.params ?? {};

  const itinerary = item?.flight_data?.FlightItinerary ?? {};
  const segments = (itinerary?.Segments ?? []).flat();
  const passengers = itinerary?.Passenger ?? [];
  const fare = itinerary?.Fare ?? {};

  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];

  const origin =
    firstSeg?.Origin?.Airport?.CityName ||
    firstSeg?.Origin?.Airport?.AirportCode ||
    itinerary?.Origin ||
    '—';
  const destination =
    lastSeg?.Destination?.Airport?.CityName ||
    lastSeg?.Destination?.Airport?.AirportCode ||
    itinerary?.Destination ||
    '—';

  const status = item?.status || itinerary?.BookingStatus || 'Confirmed';
  const bookingId = itinerary?.BookingId || item?.order_id || '—';
  const pnr = itinerary?.PNR || item?.booking_ref || '—';
  const currency = fare?.Currency || 'INR';

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar backgroundColor={Constants.dark_green} barStyle="light-content" />

      {/* header */}
      <View style={s.header}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.7} style={s.backBtn}>
          <Text style={s.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Booking Details</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}>

        {/* hero card */}
        <View style={s.heroCard}>
          <View style={s.heroRoute}>
            <View style={s.heroEndpoint}>
              <Text style={s.heroCode}>
                {firstSeg?.Origin?.Airport?.AirportCode || itinerary?.Origin || '—'}
              </Text>
              <Text style={s.heroCity} numberOfLines={1}>{origin}</Text>
            </View>

            <View style={s.heroMid}>
              <PlaneUp />
              <View style={s.heroLine} />
            </View>

            <View style={[s.heroEndpoint, s.heroEndpointRight]}>
              <Text style={s.heroCode}>
                {lastSeg?.Destination?.Airport?.AirportCode || itinerary?.Destination || '—'}
              </Text>
              <Text style={s.heroCity} numberOfLines={1}>{destination}</Text>
            </View>
          </View>

          <View style={s.heroDivider} />

          <View style={s.heroMeta}>
            <View style={s.heroMetaItem}>
              <Text style={s.heroMetaLabel}>Booking ID</Text>
              <Text style={s.heroMetaValue}>#{bookingId}</Text>
            </View>
            <View style={s.heroMetaItem}>
              <Text style={s.heroMetaLabel}>PNR</Text>
              <Text style={s.heroMetaValue}>{pnr}</Text>
            </View>
            <View style={s.heroMetaItem}>
              <Text style={s.heroMetaLabel}>Status</Text>
              <View style={[s.statusBadge, {backgroundColor: statusColor(status) + '20'}]}>
                <View style={[s.statusDot, {backgroundColor: statusColor(status)}]} />
                <Text style={[s.statusText, {color: statusColor(status)}]}>{status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* segments */}
        <SectionTitle label="Flight Segments" />
        {segments.length > 0 ? (
          segments.map((seg, i) => <SegmentCard key={i} seg={seg} index={i} />)
        ) : (
          <Text style={s.emptyText}>No segment data available.</Text>
        )}

        {/* passengers */}
        <SectionTitle label="Passengers" />
        <View style={s.card}>
          {passengers.length > 0 ? (
            passengers.map((pax, i) => (
              <React.Fragment key={i}>
                <PassengerRow pax={pax} index={i} />
                {i < passengers.length - 1 && <View style={s.rowDivider} />}
              </React.Fragment>
            ))
          ) : (
            <Text style={s.emptyText}>No passenger data available.</Text>
          )}
        </View>

        {/* fare */}
        <SectionTitle label="Fare Summary" />
        <View style={s.card}>
          <View style={s.fareRow}>
            <Text style={s.fareLabel}>Total Fare</Text>
            <Text style={s.fareValue}>
              {currency} {fmt(fare?.OfferedFare ?? item?.total_amount ?? 0)}
            </Text>
          </View>
          {fare?.TotalFare && fare.TotalFare !== fare.OfferedFare ? (
            <View style={[s.fareRow, {marginTop: 8}]}>
              <Text style={s.fareLabel}>Base Fare</Text>
              <Text style={s.fareValueSecondary}>{currency} {fmt(fare.TotalFare)}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default FlightTicketDetail;

/* ════════════ styles ════════════ */
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

  content: {padding: 14, gap: 10},
  bottomSpacer: {height: 30},

  /* section title */
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    marginTop: 6,
    marginBottom: 2,
  },

  /* hero card */
  heroCard: {
    backgroundColor: Constants.white,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  heroRoute: {flexDirection: 'row', alignItems: 'center', marginBottom: 14},
  heroEndpoint: {flex: 1},
  heroEndpointRight: {alignItems: 'flex-end'},
  heroCode: {fontSize: 26, fontFamily: FONTS.Bold, color: Constants.black},
  heroCity: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.customgrey3, marginTop: 2},
  heroMid: {alignItems: 'center', gap: 4, paddingHorizontal: 8},
  heroLine: {width: 48, height: 1, backgroundColor: '#d1d5db'},
  heroDivider: {height: 1, backgroundColor: '#f0f0f0', marginVertical: 14},
  heroMeta: {flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10},
  heroMetaItem: {gap: 4},
  heroMetaLabel: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  heroMetaValue: {fontSize: 13, fontFamily: FONTS.SemiBold, color: Constants.black},

  /* status badge */
  statusBadge: {flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3},
  statusDot: {width: 7, height: 7, borderRadius: 4},
  statusText: {fontSize: 12, fontFamily: FONTS.SemiBold},

  /* segment card */
  segCard: {
    backgroundColor: Constants.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segHeader: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12},
  segAirline: {fontSize: 13, fontFamily: FONTS.SemiBold, color: Constants.black},
  segFlight: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  segRoute: {flexDirection: 'row', alignItems: 'center'},
  segEndpoint: {flex: 1},
  segEndpointRight: {alignItems: 'flex-end'},
  segTime: {fontSize: 20, fontFamily: FONTS.Bold, color: Constants.black},
  segCode: {fontSize: 13, fontFamily: FONTS.SemiBold, color: Constants.dark_green, marginTop: 2},
  segCity: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3, marginTop: 1, maxWidth: 100},
  segTerminal: {fontSize: 10, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  segDate: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3, marginTop: 4},
  segMid: {alignItems: 'center', gap: 4, paddingHorizontal: 8},
  segLine: {width: 36, height: 1, backgroundColor: '#d1d5db'},
  segDuration: {fontSize: 10, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  segFooter: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10},
  segBag: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3},

  /* generic card */
  card: {
    backgroundColor: Constants.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  /* passengers */
  paxRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8},
  paxLeft: {flex: 1},
  paxName: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.black},
  paxMeta: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.customgrey3, marginTop: 2},
  paxTicket: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  rowDivider: {height: 1, backgroundColor: '#f0f0f0'},

  /* fare */
  fareRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  fareLabel: {fontSize: 14, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  fareValue: {fontSize: 18, fontFamily: FONTS.Bold, color: Constants.dark_green},
  fareValueSecondary: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.black},

  emptyText: {fontSize: 13, fontFamily: FONTS.Regular, color: Constants.customgrey3, paddingVertical: 8},
});
