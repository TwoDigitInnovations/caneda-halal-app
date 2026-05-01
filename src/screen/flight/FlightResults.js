/* eslint-disable react-hooks/exhaustive-deps */
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Svg, Path, Line, Polygon} from 'react-native-svg';
import Constants, {FONTS} from '../../Assets/Helpers/constant';
import moment from 'moment';
import {Post} from '../../Assets/Helpers/Service';
import { ToastContext } from '../../../App';

/* ── icons ── */
const PlaneIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.5L13.5 11V4.5C13.5 3.67 12.83 3 12 3C11.17 3 10.5 3.67 10.5 4.5V11L2 16.5V18.5L10.5 16V20L8.5 21.5V23L12 22L15.5 23V21.5L13.5 20V16L22 18.5V16.5Z"
      fill={Constants.dark_green}
    />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
      stroke={Constants.customgrey3}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BaggageIcon = () => (
  <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1zM3 7h18a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a1 1 0 0 1 1-1zm9 3v8M9 10v8M15 10v8"
      stroke={Constants.customgrey3}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ArrowLine = () => (
  <Svg width="100%" height="16" viewBox="0 0 100 16">
    <Line x1="0" y1="8" x2="90" y2="8" stroke={Constants.customgrey5} strokeWidth="1.5" />
    <Polygon points="90,4 100,8 90,12" fill={Constants.customgrey5} />
  </Svg>
);

/* ── helpers ── */
const cityName = str => (str || '').replace(/\s*\([A-Z]{3}\)/, '').trim();

const getTotalPassengers = p =>
  (p?.adults ?? 1) + (p?.children ?? 0) + (p?.infantOnSeat ?? 0) + (p?.infantOnLap ?? 0);

const formatDuration = mins => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const formatPrice = n =>
  Number(n)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/* ── LCC badge ── */
const LccBadge = ({isLCC}) => (
  <View style={isLCC ? styles.lccBadgeLCC : styles.lccBadgeFSC}>
    <Text style={isLCC ? styles.lccTextLCC : styles.lccTextFSC}>
      {isLCC ? 'LCC' : 'Full Service'}
    </Text>
  </View>
);

/* ── flight card ── */
const FlightCard = ({item, onPress}) => {
  const legSegs = item?.Segments?.[0];
  if (!legSegs?.length) {return null;}

  const firstSeg = legSegs[0];
  const lastSeg = legSegs[legSegs.length - 1];

  const depTime = moment(firstSeg.Origin.DepTime).format('HH:mm');
  const arrTime = moment(lastSeg.Destination.ArrTime).format('HH:mm');
  const depCode = firstSeg.Origin.Airport.AirportCode;
  const arrCode = lastSeg.Destination.Airport.AirportCode;

  // prefer AccumulatedDuration on last segment; fall back to summing all segments + ground times
  const totalMins = lastSeg.AccumulatedDuration
    || legSegs.reduce((sum, s) => sum + (s.Duration || 0) + (s.GroundTime || 0), 0);
  const duration = formatDuration(totalMins);

  const stopCount = legSegs.length - 1;
  const stopCodes = legSegs.slice(0, -1).map(s => s.Destination.Airport.AirportCode).join(', ');
  const stops = stopCount === 0
    ? 'Non stop'
    : `${stopCount} Stop${stopCount > 1 ? 's' : ''} · ${stopCodes}`;

  const price = item.Fare.OfferedFare;
  const currency = item.Fare.Currency;
  const fareType = item.FareClassification?.Type;
  const fareColor = item.FareClassification?.Color?.trim();
  const flightNum = `${firstSeg.Airline.AirlineCode} ${firstSeg.Airline.FlightNumber}`;
  const baggage = firstSeg.Baggage || firstSeg.CabinBaggage || '';
  const depDate = moment(firstSeg.Origin.DepTime).format('DD MMM');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* header: airline + flight no + fare badge */}
      <View style={styles.cardHeader}>
        <PlaneIcon />
        <View style={styles.headerText}>
          <Text style={styles.airlineName}>{firstSeg.Airline.AirlineName}</Text>
          <Text style={styles.flightNum}>{flightNum}</Text>
        </View>
        <LccBadge isLCC={item.IsLCC} />
        {fareType ? (
          <View style={[styles.fareBadge, {backgroundColor: fareColor || '#eee'}]}>
            <Text style={styles.fareBadgeText}>{fareType}</Text>
          </View>
        ) : null}
      </View>

      {/* times row */}
      <View style={styles.cardBody}>
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{depTime}</Text>
          <Text style={styles.airportCode}>{depCode}</Text>
        </View>

        <View style={styles.durationBlock}>
          <Text style={styles.durationText}>{duration}</Text>
          <View style={styles.arrowWrapper}>
            <ArrowLine />
          </View>
          <Text style={styles.stopsText}>{stops}</Text>
        </View>

        <View style={styles.timeBlock}>
          <Text style={styles.time}>{arrTime}</Text>
          <Text style={styles.airportCode}>{arrCode}</Text>
        </View>
      </View>

      {/* footer */}
      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <CalendarIcon />
          <Text style={styles.footerDate}>{depDate}</Text>
          {!!baggage && (
            <View style={styles.baggageTag}>
              <BaggageIcon />
              <Text style={styles.baggageText}>{baggage}</Text>
            </View>
          )}
          {item.IsRefundable && (
            <View style={styles.refundTag}>
              <Text style={styles.refundText}>Refundable</Text>
            </View>
          )}
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceAmount}>{currency} {formatPrice(price)}</Text>
          <Text style={styles.perAdult}>/adult</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* ── multi-city / round-trip flight card ── */
const MultiCityFlightCard = ({item, onPress, tripLabel}) => {
  if (!item?.Segments?.length) {return null;}

  const price = item.Fare.OfferedFare;
  const currency = item.Fare.Currency;
  const fareType = item.FareClassification?.Type;
  const fareColor = item.FareClassification?.Color?.trim();
  const airline = item.ValidatingAirline || item.Segments[0]?.[0]?.Airline?.AirlineCode || '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* header */}
      <View style={styles.cardHeader}>
        <PlaneIcon />
        <View style={styles.headerText}>
          <Text style={styles.airlineName}>{airline}</Text>
          <Text style={styles.flightNum}>{tripLabel || 'Multi-City'} · {item.Segments.length} legs</Text>
        </View>
        <LccBadge isLCC={item.IsLCC} />
        {fareType ? (
          <View style={[styles.fareBadge, {backgroundColor: fareColor || '#eee'}]}>
            <Text style={styles.fareBadgeText}>{fareType}</Text>
          </View>
        ) : null}
      </View>

      {/* one row per leg */}
      {item.Segments.map((legSegs, legIdx) => {
        const firstSeg = legSegs[0];
        const lastSeg = legSegs[legSegs.length - 1];
        if (!firstSeg || !lastSeg) {return null;}

        const depTime = moment(firstSeg.Origin.DepTime).format('HH:mm');
        const arrTime = moment(lastSeg.Destination.ArrTime).format('HH:mm');
        const depCode = firstSeg.Origin.Airport.AirportCode;
        const arrCode = lastSeg.Destination.Airport.AirportCode;
        const depCity = firstSeg.Origin.Airport.CityName;
        const arrCity = lastSeg.Destination.Airport.CityName;
        const totalDuration = legSegs.reduce((sum, s) => sum + (s.Duration || 0), 0);
        const stopCount = legSegs.length - 1;
        const stopCodes = legSegs.slice(0, -1).map(s => s.Destination.Airport.AirportCode).join(', ');
        const stopsText = stopCount === 0
          ? 'Non stop'
          : `${stopCount} Stop${stopCount > 1 ? 's' : ''} · ${stopCodes}`;
        const depDate = moment(firstSeg.Origin.DepTime).format('DD MMM');

        return (
          <View
            key={legIdx}
            style={[styles.mcLegRow, legIdx > 0 && styles.mcLegRowBorder]}>
            <View style={styles.mcLegIndex}>
              <Text style={styles.mcLegNum}>{legIdx + 1}</Text>
            </View>
            <View style={styles.mcTimeBlock}>
              <Text style={styles.mcTime}>{depTime}</Text>
              <Text style={styles.mcCode}>{depCode}</Text>
              <Text style={styles.mcCity} numberOfLines={1}>{depCity}</Text>
            </View>
            <View style={styles.mcMid}>
              <Text style={styles.mcDuration}>{formatDuration(totalDuration)}</Text>
              <View style={styles.arrowWrapper}><ArrowLine /></View>
              <Text style={styles.mcStops}>{stopsText}</Text>
              <Text style={styles.mcDate}>{depDate}</Text>
            </View>
            <View style={styles.mcTimeBlockRight}>
              <Text style={styles.mcTime}>{arrTime}</Text>
              <Text style={styles.mcCode}>{arrCode}</Text>
              <Text style={styles.mcCity} numberOfLines={1}>{arrCity}</Text>
            </View>
          </View>
        );
      })}

      {/* footer */}
      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          {item.IsRefundable && (
            <View style={styles.refundTag}>
              <Text style={styles.refundText}>Refundable</Text>
            </View>
          )}
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceAmount}>{currency} {formatPrice(price)}</Text>
          <Text style={styles.perAdult}>/adult</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* ── empty / loading ── */
const EmptyState = ({loading}) => (
  <View style={styles.emptyWrap}>
    {loading ? (
      <ActivityIndicator size="large" color={Constants.dark_green} />
    ) : (
      <Text style={styles.emptyText}>No flights found</Text>
    )}
  </View>
);

/* ── screen ── */
const FlightResults = ({navigation, route}) => {
  const {
    from, to, fromCode, toCode,
    departureDate, passengers,
    isoneway = 'Yes', return_date,
    isMultiCity = false, legs = [],
    cabinClass = 2,
    category={}
  } = route?.params ?? {};
console.log('search params', route?.params);
  const cabinCategoryLabel = {2: 'Economy', 3: 'Premium Economy', 4: 'Business', 5: 'Premium Business', 6: 'First'};
  const flightCategory = cabinCategoryLabel[cabinClass] ?? 'Economy';

  const [flights, setFlights] = useState([]);
  const [traceId, setTraceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [, setToast] = useContext(ToastContext);

  const total = getTotalPassengers(passengers);

  const headerTitle = isMultiCity
    ? legs.map(l => cityName(l.from) || l.fromCode).join(' → ')
    : `${cityName(from) || 'Origin'} - ${cityName(to) || 'Destination'}`;

  const subtitle = isMultiCity
    ? [`${legs.length} cities`, `${total} Adult${total > 1 ? 's' : ''}`, flightCategory].join('  |  ')
    : [
        departureDate ? moment(departureDate).format('Do MMM') : null,
        `${total} Adult${total > 1 ? 's' : ''}`,
        flightCategory,
      ]
        .filter(Boolean)
        .join('  |  ');

  useEffect(() => {
    if (isMultiCity ? legs.length > 0 : from) {
      getResult();
    }
  }, [from, to, departureDate, passengers, isoneway, return_date, isMultiCity]);

  const getResult = () => {
    setLoading(true);

    let data;
    if (isMultiCity) {
      data = {
        adults: String(passengers?.adults ?? 1),
        children: String(passengers?.children ?? 0),
        infants: String((passengers?.infantOnSeat ?? 0) + (passengers?.infantOnLap ?? 0)),
        isoneway: 'MultiCity',
        Flights_category: flightCategory,
        Segments: legs.map(leg => ({
          Origin: leg.fromCode,
          Destination: leg.toCode,
          FlightCabinClass: cabinClass,
          PreferredDepartureTime: moment(leg.date).format('YYYY-MM-DD'),
          PreferredArrivalTime: moment(leg.date).format('YYYY-MM-DD'),
        })),
      };
    } else {
      data = {
        adults: String(passengers?.adults ?? 1),
        children: String(passengers?.children ?? 0),
        infants: String((passengers?.infantOnSeat ?? 0) + (passengers?.infantOnLap ?? 0)),
        isoneway,
        From_IATACODE: fromCode,
        To_IATACODE: toCode,
        departure_date: departureDate ? moment(departureDate).format('YYYY-MM-DD') : null,
        Flights_category: category.slug,
      };
      if (isoneway === 'No') {
        data.return_date = return_date ? moment(return_date).format('YYYY-MM-DD') : null;
      }
    }

    let endpoint = 'flight/search';
    if (isMultiCity) {
      endpoint = 'flight/multicity-search';
    }

    Post(endpoint, data).then(
      res => {
        console.log('search res', res);
        setLoading(false);
        const responseFlights = res?.data?.responseData?.Response;
        if (res.status && responseFlights.Error.ErrorCode === 0) {
          setFlights(responseFlights.Results[0] || []);
          setTraceId(responseFlights.TraceId ?? null);
        }else{
          setToast(responseFlights.Error.ErrorMessage || 'An error occurred');
        }
      },
      () => {
        setLoading(false);
      },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Constants.dark_green} barStyle="light-content" />

      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>{headerTitle}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
      </View>

      {/* results count */}
      {!loading && flights.length > 0 && (
        <View style={styles.countBar}>
          <Text style={styles.countText}>{flights.length} flights found</Text>
        </View>
      )}

      <FlatList
        data={flights}
        keyExtractor={(item, i) => item.ResultIndex || String(i)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState loading={loading} />}
        renderItem={({item}) => {
          const onPress = () =>
            navigation.navigate('FlightDetail', {
              flight: item,
              from: isMultiCity ? legs[0]?.from : from,
              to: isMultiCity ? legs[legs.length - 1]?.to : to,
              fromCode: isMultiCity ? legs[0]?.fromCode : fromCode,
              toCode: isMultiCity ? legs[legs.length - 1]?.toCode : toCode,
              departureDate: isMultiCity ? legs[0]?.date : departureDate,
              return_date,
              passengers,
              traceId,
              isoneway,
              isMultiCity,
              legs,
            });
          if (item.Segments?.length > 1) {
            const tripLabel = isoneway === 'No' ? 'Round Trip' : 'Multi-City';
            return <MultiCityFlightCard item={item} onPress={onPress} tripLabel={tripLabel} />;
          }
          return <FlightCard item={item} onPress={onPress} />;
        }}
      />
    </SafeAreaView>
  );
};

export default FlightResults;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f2f2f2'},

  /* header */
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
  headerTitle: {fontSize: 20, fontFamily: FONTS.Bold, color: Constants.white, lineHeight: 26},
  headerSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.Regular,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 3,
  },

  countBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f2f2f2',
  },
  countText: {
    fontSize: 13,
    fontFamily: FONTS.Medium,
    color: Constants.customgrey3,
  },

  /* list */
  list: {paddingHorizontal: 14, paddingTop: 10, paddingBottom: 110, gap: 14},

  /* card */
  card: {
    backgroundColor: Constants.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  /* card header */
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  headerText: {flex: 1},
  airlineName: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.black},
  flightNum: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3, marginTop: 1},
  fareBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  fareBadgeText: {fontSize: 10, fontFamily: FONTS.SemiBold, color: '#333'},
  lccBadgeLCC: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: '#fff3e0',
  },
  lccBadgeFSC: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
  },
  lccTextLCC: {fontSize: 10, fontFamily: FONTS.SemiBold, color: '#e65100'},
  lccTextFSC: {fontSize: 10, fontFamily: FONTS.SemiBold, color: '#2e7d32'},

  /* times */
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 16,
  },
  timeBlock: {alignItems: 'center', width: 70},
  time: {fontSize: 24, fontFamily: FONTS.Regular, color: Constants.black, lineHeight: 28},
  airportCode: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.customgrey3, marginTop: 4},
  durationBlock: {flex: 1, alignItems: 'center', paddingHorizontal: 6},
  durationText: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  arrowWrapper: {width: '100%', height: 16},
  stopsText: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3},

  /* footer */
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  footerLeft: {flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap'},
  footerDate: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  baggageTag: {flexDirection: 'row', alignItems: 'center', gap: 3},
  baggageText: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  refundTag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  refundText: {fontSize: 10, fontFamily: FONTS.Medium, color: '#2e7d32'},
  priceRow: {flexDirection: 'row', alignItems: 'baseline', gap: 1},
  priceAmount: {fontSize: 15, fontFamily: FONTS.SemiBold, color: Constants.black},
  perAdult: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3},

  /* multi-city leg rows */
  mcLegRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  mcLegRowBorder: {borderTopWidth: 1, borderTopColor: '#f0f0f0'},
  mcLegIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Constants.dark_green,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  mcLegNum: {fontSize: 11, fontFamily: FONTS.Bold, color: Constants.white},
  mcTimeBlock: {alignItems: 'flex-start', width: 62},
  mcTimeBlockRight: {alignItems: 'flex-end', width: 62},
  mcTime: {fontSize: 18, fontFamily: FONTS.SemiBold, color: Constants.black, lineHeight: 22},
  mcCode: {fontSize: 12, fontFamily: FONTS.Bold, color: Constants.dark_green, marginTop: 1},
  mcCity: {fontSize: 10, fontFamily: FONTS.Regular, color: Constants.customgrey3, marginTop: 1},
  mcMid: {flex: 1, alignItems: 'center'},
  mcDuration: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  mcStops: {fontSize: 10, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  mcDate: {fontSize: 10, fontFamily: FONTS.Regular, color: Constants.customgrey3, marginTop: 2},

  /* empty */
  emptyWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80},
  emptyText: {fontSize: 15, fontFamily: FONTS.Regular, color: Constants.customgrey3},
});
