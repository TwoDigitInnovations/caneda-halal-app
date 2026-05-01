import React, {useState, useCallback, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Svg, Path} from 'react-native-svg';
import Constants, {FONTS} from '../../Assets/Helpers/constant';
import {GetApi} from '../../Assets/Helpers/Service';
import {cancelBooking, getCancellationCharges} from '../../Assets/Helpers/FlightService';
import {navigate} from '../../../navigationRef';
import moment from 'moment';
import { ToastContext } from '../../../App';

/* ── icons ── */
const CalIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2V5M16 2V5M3.5 9H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
      stroke={Constants.customgrey3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const PlaneIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.5L13.5 11V4.5C13.5 3.67 12.83 3 12 3C11.17 3 10.5 3.67 10.5 4.5V11L2 16.5V18.5L10.5 16V20L8.5 21.5V23L12 22L15.5 23V21.5L13.5 20V16L22 18.5V16.5Z"
      fill={Constants.customgrey3}
    />
  </Svg>
);

const SeatIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 2H18M7 2V13H17V2M5 13H19M5 13L3 22H21L19 13"
      stroke={Constants.customgrey3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

/* ── helpers ── */
const formatPrice = n =>
  Number(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const statusColor = status => {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed' || s === 'ticketed') {return '#22c55e';}
  if (s === 'cancelled' || s === 'failed') {return '#ef4444';}
  if (s === 'completed') {return '#3b82f6';}
  return '#9ca3af';
};

/* ── booking card ── */
const BookingCard = ({item, onCancel, cancelling, onViewDetail}) => {
  const itinerary = item?.flight_data?.FlightItinerary ?? {};
  const passengers = itinerary?.Passenger ?? [];
  const leadPax = passengers[0];
  const segments = (itinerary?.Segments ?? []).flat();
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];

  const origin = firstSeg?.Origin?.Airport?.CityName
    || firstSeg?.Origin?.Airport?.AirportCode
    || itinerary?.Origin
    || '—';
  const destination = lastSeg?.Destination?.Airport?.CityName
    || lastSeg?.Destination?.Airport?.AirportCode
    || itinerary?.Destination
    || '—';

  const bookingId = itinerary?.BookingId || item?.order_id || '—';
  const pnr = itinerary?.PNR || item?.booking_ref || '';

  const depTime = firstSeg?.Origin?.DepTime || item?.createdAt;
  const dateStr = depTime ? moment(depTime).format('Do MMM, YYYY') : '—';

  const airline = firstSeg?.Airline?.AirlineName || '—';
  const flightNo = firstSeg
    ? `${firstSeg.Airline?.AirlineCode} ${firstSeg.Airline?.FlightNumber}`
    : '—';

  const price = item?.total_amount ?? itinerary?.Fare?.OfferedFare;
  const currency = itinerary?.Fare?.Currency || 'INR';

  const status = item?.status || itinerary?.BookingStatus || 'Confirmed';

  return (
    <View style={s.card}>
      {/* route + booking id */}
      <View style={s.cardTop}>
        <Text style={s.route} numberOfLines={1}>{origin} → {destination}</Text>
        <Text style={s.bookingId}>#{bookingId}</Text>
      </View>

      {/* lead passenger */}
      {leadPax ? (
        <Text style={s.paxName}>
          {leadPax.FirstName} {leadPax.LastName}
        </Text>
      ) : null}

      {/* meta row */}
      <View style={s.infoRow}>
        <View style={s.infoItem}>
          <CalIcon />
          <Text style={s.infoText}>{dateStr}</Text>
        </View>
        <View style={s.infoItem}>
          <PlaneIcon />
          <Text style={s.infoText}>{flightNo !== '—' ? flightNo : airline}</Text>
        </View>
        {pnr ? (
          <View style={s.infoItem}>
            <SeatIcon />
            <Text style={s.infoText}>PNR: {pnr}</Text>
          </View>
        ) : null}
      </View>

      {/* status + fare */}
      <View style={s.cardBottom}>
        <View style={s.statusRow}>
          <View style={[s.statusDot, {backgroundColor: statusColor(status)}]} />
          <Text style={s.statusText}>{status}</Text>
        </View>
        {price ? (
          <Text style={s.fareText}>{currency} {formatPrice(price)}</Text>
        ) : null}
      </View>

      {/* action buttons */}
      <View style={s.cardActions}>
        <TouchableOpacity
          style={s.detailBtn}
          activeOpacity={0.7}
          onPress={() => onViewDetail(item)}>
          <Text style={s.detailBtnText}>View Details</Text>
        </TouchableOpacity>

        {!['cancelled', 'failed', 'completed'].includes(status.toLowerCase()) && (
          <TouchableOpacity
            style={s.cancelBtn}
            activeOpacity={0.7}
            disabled={cancelling}
            onPress={() => onCancel(item)}>
            {cancelling ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Text style={s.cancelBtnText}>Cancel Booking</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/* ── cancellation charge display ── */
const CancelChargeInfo = ({charges, item}) => {
  const resp = charges?.Response ?? {};
  const cancellationCharge = resp?.CancellationCharge ?? null;
  const refundAmount = resp?.RefundAmount ?? null;
  const currency = resp?.Currency || item?.flight_data?.FlightItinerary?.Fare?.Currency || 'INR';

  const itinerary = item?.flight_data?.FlightItinerary ?? {};
  const segments = (itinerary?.Segments ?? []).flat();
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];
  const origin = firstSeg?.Origin?.Airport?.CityCode || itinerary?.Origin || '—';
  const destination = lastSeg?.Destination?.Airport?.CityCode || itinerary?.Destination || '—';

  return (
    <View style={s.chargeBox}>
      <Text style={s.chargeRoute}>{origin} → {destination}</Text>
      {cancellationCharge != null ? (
        <>
          <View style={s.chargeRow}>
            <Text style={s.chargeLabel}>Cancellation Charge</Text>
            <Text style={s.chargeAmt}>{currency} {formatPrice(cancellationCharge)}</Text>
          </View>
          <View style={[s.chargeRow, s.refundRow]}>
            <Text style={s.chargeLabel}>Refund Amount</Text>
            <Text style={s.refundAmt}>{currency} {formatPrice(refundAmount ?? 0)}</Text>
          </View>
        </>
      ) : (
        <Text style={s.chargeUnknown}>Charges will be calculated by the airline.</Text>
      )}
    </View>
  );
};

/* ── type selectors ── */
const REQUEST_TYPES = [
  {label: 'NotSet', value: 0},
  {label: 'Full Cancel', value: 1},
  {label: 'Partial Cancel', value: 2},
  {label: 'Reissuance', value: 3},
];

const CANCELLATION_TYPES = [
  {label: 'NotSet', value: 0},
  {label: 'No Show', value: 1},
  {label: 'Flight Cancelled', value: 2},
  {label: 'Others', value: 3},
];

const TypeSelector = ({label, options, value, onChange}) => (
  <View style={s.selectorWrap}>
    <Text style={s.selectorLabel}>{label}</Text>
    <View style={s.selectorOptions}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[s.selectorChip, value === opt.value && s.selectorChipActive]}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.7}>
          <Text style={[s.selectorChipText, value === opt.value && s.selectorChipTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

/* ── empty / loading states ── */
const EmptyState = ({loading}) => (
  <View style={s.emptyWrap}>
    {loading ? (
      <ActivityIndicator size="large" color={Constants.dark_green} />
    ) : (
      <>
        <Text style={s.emptyIcon}>✈️</Text>
        <Text style={s.emptyTitle}>No bookings yet</Text>
        <Text style={s.emptySub}>Your flight bookings will appear here.</Text>
      </>
    )}
  </View>
);

/* ════════════ screen ════════════ */
const FlightHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [fetchingChargesId, setFetchingChargesId] = useState(null);
    const [toast, setToast] = useContext(ToastContext);
  const [chargeModal, setChargeModal] = useState({
    visible: false,
    item: null,
    charges: null,
    requestType: 1,
    cancellationType: 2,
    remark: '',
  });

  const closeChargeModal = () =>
    setChargeModal({visible: false, item: null, charges: null, requestType: 1, cancellationType: 2, remark: ''});

  const handleCancel = item => {
    const bookingId = item?.flight_data?.FlightItinerary?.BookingId;
    console.log(bookingId)
    setFetchingChargesId(bookingId);
    getCancellationCharges({BookingId: String(bookingId), RequestType: '1'})
      .then(res => {
        console.log(res)

        setFetchingChargesId(null);
        setChargeModal({visible: true, item, charges: res?.data ?? res, requestType: 1, cancellationType: 2});
      })
      .catch(() => {
        setFetchingChargesId(null);
        Alert.alert('Error', 'Could not fetch cancellation charges. Please try again.');
      });
  };

  const confirmCancel = () => {
    const {item} = chargeModal;
    const itinerary = item?.flight_data?.FlightItinerary ?? {};
    const bookingId = itinerary?.BookingId;

    const ticketIds = (itinerary?.Passenger ?? [])
      .map(p => p?.Ticket?.TicketId)
      .filter(Boolean);

    const sectors = (itinerary?.Segments ?? []).flat().map(seg => ({
      Origin: seg?.Origin?.Airport?.AirportCode,
      Destination: seg?.Destination?.Airport?.AirportCode,
    }));

   
    setCancellingId(bookingId);
    cancelBooking({
      order_id: item?.order_id,
      BookingId: bookingId,
      RequestType: chargeModal.requestType,
      CancellationType: chargeModal.cancellationType,
      Sectors: sectors,
      TicketId: ticketIds,
      Remarks: chargeModal.remark,
      EndUserIp: '0.0.0.0',
    })
      .then((res) => {
        console.log(res)

        const response = res.data.responseData.Response;
        if(response?.Error?.ErrorCode > 0){
           Alert.alert(response.Error.ErrorMessage)
        }else{
            closeChargeModal();
            setCancellingId(null);
            setBookings(prev =>
            prev.map(b =>
              b?.flight_data?.FlightItinerary?.BookingId === bookingId
                ? {...b, status: 'Cancelled'}
                : b,
            ),
        );
       
        }
       
      })
      .catch(() => {
        setCancellingId(null);
        Alert.alert('Error', 'Failed to cancel booking. Please try again.');
      });
  };


  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      GetApi('getBookingHistoryByUser').then(
        res => {
          setLoading(false);
          const list = res?.data?.data;
          console.log(list)
          if (Array.isArray(list)) {
            setBookings(list);
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
        <Text style={s.headerTitle}>Booking History</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item, i) => String(item?.BookingId ?? item?.order_id ?? i)}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState loading={loading} />}
        renderItem={({item}) => (
          <BookingCard
            item={item}
            onCancel={handleCancel}
            onViewDetail={i => navigate('FlightTicketDetail', {item: i})}
            cancelling={
              cancellingId === item?.flight_data?.FlightItinerary?.BookingId ||
              fetchingChargesId === item?.flight_data?.FlightItinerary?.BookingId
            }
          />
        )}
      />

      {/* cancellation charges confirmation modal */}
      <Modal
        visible={chargeModal.visible}
        transparent
        animationType="fade"
        onRequestClose={closeChargeModal}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Cancel Booking</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <CancelChargeInfo charges={chargeModal.charges} item={chargeModal.item} />

              <TypeSelector
                label="Request Type"
                options={REQUEST_TYPES}
                value={chargeModal.requestType}
                onChange={val => setChargeModal(prev => ({...prev, requestType: val}))}
              />

              <TypeSelector
                label="Cancellation Type"
                options={CANCELLATION_TYPES}
                value={chargeModal.cancellationType}
                onChange={val => setChargeModal(prev => ({...prev, cancellationType: val}))}
              />

              <View style={s.remarkWrap}>
                <Text style={s.remarkLabel}>Remark</Text>
                <TextInput
                  style={s.remarkInput}
                  placeholder="Enter remark (optional)"
                  placeholderTextColor={Constants.customgrey3}
                  value={chargeModal.remark}
                  onChangeText={val => setChargeModal(prev => ({...prev, remark: val}))}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <Text style={s.modalNote}>
                Refund (if applicable) will be processed per airline policy. This action cannot be undone.
              </Text>
            </ScrollView>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalGoBack} onPress={closeChargeModal}>
                <Text style={s.modalGoBackText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalConfirm} onPress={confirmCancel}>
                <Text style={s.modalConfirmText}>Confirm Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FlightHistory;

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

  list: {padding: 14, gap: 12, paddingBottom: 110},

  card: {
    backgroundColor: Constants.white,
    borderRadius: 14,
    padding: 14,
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
    marginBottom: 4,
  },
  route: {fontSize: 15, fontFamily: FONTS.SemiBold, color: Constants.black, flex: 1, marginRight: 8},
  bookingId: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  paxName: {fontSize: 12, fontFamily: FONTS.Medium, color: Constants.customgrey3, marginBottom: 8},
  infoRow: {flexDirection: 'row', gap: 12, marginBottom: 10, flexWrap: 'wrap'},
  infoItem: {flexDirection: 'row', alignItems: 'center', gap: 5},
  infoText: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    marginTop: 2,
  },
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 7},
  statusDot: {width: 9, height: 9, borderRadius: 5},
  statusText: {fontSize: 13, fontFamily: FONTS.Medium, color: Constants.black},
  fareText: {fontSize: 14, fontFamily: FONTS.Bold, color: Constants.dark_green},

  cardActions: {flexDirection: 'row', gap: 8, marginTop: 12},
  detailBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Constants.dark_green,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  detailBtnText: {fontSize: 13, fontFamily: FONTS.SemiBold, color: Constants.dark_green},
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelBtnText: {fontSize: 13, fontFamily: FONTS.SemiBold, color: '#ef4444'},

  /* modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: Constants.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  modalTitle: {fontSize: 17, fontFamily: FONTS.Bold, color: Constants.black, marginBottom: 14},
  modalNote: {
    fontSize: 12,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey3,
    marginTop: 14,
    lineHeight: 18,
  },
  modalActions: {flexDirection: 'row', gap: 10, marginTop: 18},
  modalGoBack: {
    flex: 1,
    borderWidth: 1,
    borderColor: Constants.customgrey3,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  modalGoBackText: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.black},
  modalConfirm: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  modalConfirmText: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.white},

  /* charge info */
  chargeBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  chargeRoute: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.black},
  chargeRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  chargeLabel: {fontSize: 13, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  chargeAmt: {fontSize: 15, fontFamily: FONTS.Bold, color: '#ef4444'},
  refundRow: {marginTop: 6},
  refundAmt: {fontSize: 15, fontFamily: FONTS.Bold, color: '#22c55e'},
  chargeUnknown: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.customgrey3},

  /* type selector */
  selectorWrap: {marginTop: 14},
  selectorLabel: {fontSize: 13, fontFamily: FONTS.SemiBold, color: Constants.black, marginBottom: 8},
  selectorOptions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  selectorChip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectorChipActive: {
    borderColor: Constants.dark_green,
    backgroundColor: Constants.dark_green,
  },
  selectorChipText: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.black},
  selectorChipTextActive: {color: Constants.white, fontFamily: FONTS.SemiBold},

  /* remark */
  remarkWrap: {marginTop: 14},
  remarkLabel: {fontSize: 13, fontFamily: FONTS.SemiBold, color: Constants.black, marginBottom: 8},
  remarkInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: FONTS.Regular,
    color: Constants.black,
    minHeight: 72,
  },

  /* empty */
  emptyWrap: {alignItems: 'center', paddingTop: 80, gap: 10},
  emptyIcon: {fontSize: 48},
  emptyTitle: {fontSize: 16, fontFamily: FONTS.SemiBold, color: Constants.black},
  emptySub: {fontSize: 13, fontFamily: FONTS.Regular, color: Constants.customgrey3},
});
