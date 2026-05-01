import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Svg, Rect, Path} from 'react-native-svg';
import Constants, {FONTS} from '../../Assets/Helpers/constant';
import {Post} from '../../Assets/Helpers/Service';
import moment from 'moment';

/* ─── SVG icons ─── */
const AirlineLogo = () => (
  <Svg width="26" height="26" viewBox="0 0 26 26">
    <Rect width="26" height="26" rx="4" fill="#d6d6d6" />
    <Path d="M13 6l1.8 4.5H19l-3.9 2.8 1.5 4.7L13 15.4l-4.6 2.6 1.5-4.7L6 11.5h4.2z" fill="#999" />
  </Svg>
);

const CheckedBox = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16">
    <Rect width="16" height="16" rx="3" fill={Constants.dark_green} />
    <Path d="M3.5 8L6.5 11L12.5 5" stroke="#fff" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UncheckedBox = () => (
  <Svg width="18" height="18" viewBox="0 0 18 18">
    <Rect x="0.75" y="0.75" width="16.5" height="16.5" rx="3.25"
      stroke="#b0b0b0" strokeWidth="1.5" fill="white" />
  </Svg>
);

const InfoDot = () => (
  <Svg width="12" height="12" viewBox="0 0 12 12">
    <Rect width="12" height="12" rx="2" fill="#6b6b6b" />
  </Svg>
);

/* ─── helpers ─── */
const stripCode = str => (str || '').replace(/\s*\([A-Z]{3}\)/, '').trim();

const getTotalPassengers = p =>
  (p?.adults ?? 1) + (p?.children ?? 0) + (p?.infantOnSeat ?? 0) + (p?.infantOnLap ?? 0);

const formatDuration = mins => {
  if (!mins) {return '';}
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const formatPrice = n =>
  Number(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const terminal = t => (t ? `, T${t}` : '');

/* ─── dashed divider ─── */
const DashedLine = () => (
  <View style={s.dashedWrap}>
    {Array.from({length: 50}).map((_, i) => (
      <View key={i} style={s.dash} />
    ))}
  </View>
);

/* ─── single API flight segment ─── */
const Segment = ({seg}) => {
  const airlineName = seg.Airline?.AirlineName || '';
  const flightNo = `${seg.Airline?.AirlineCode} ${seg.Airline?.FlightNumber}`;
  const aircraft = seg.Craft || '';
  const baggage = seg.Baggage || '';
  const cabinBaggage = seg.CabinBaggage || '';

  const dep     = moment(seg.Origin?.DepTime).format('HH:mm');
  const depDate = moment(seg.Origin?.DepTime).format('Do MMM, ddd');
  const depCity = seg.Origin?.Airport?.CityName || '';
  const depFull = seg.Origin?.Airport?.AirportName || '';
  const depCode = `${seg.Origin?.Airport?.AirportCode}${terminal(seg.Origin?.Airport?.Terminal)}`;

  const arr     = moment(seg.Destination?.ArrTime).format('HH:mm');
  const arrDate = moment(seg.Destination?.ArrTime).format('Do MMM, ddd');
  const arrCity = seg.Destination?.Airport?.CityName || '';
  const arrFull = seg.Destination?.Airport?.AirportName || '';
  const arrCode = `${seg.Destination?.Airport?.AirportCode}${terminal(seg.Destination?.Airport?.Terminal)}`;

  const duration = formatDuration(seg.Duration);

  return (
    <View>
      <View style={s.airlineRow}>
        <AirlineLogo />
        <Text style={s.airlineName}>{airlineName}</Text>
        <Text style={s.flightMeta}>  |  {flightNo}  |  {aircraft}</Text>
      </View>

      {(cabinBaggage || baggage) ? (
        <View style={s.baggageRow}>
          {!!cabinBaggage && <Text style={s.baggageTag}>Cabin: {cabinBaggage}</Text>}
          {!!baggage && <Text style={s.baggageTag}>Check-in: {baggage}</Text>}
        </View>
      ) : null}

      <DashedLine />

      <View style={s.timesRow}>
        <View style={s.timeColLeft}>
          <Text style={s.timeText}>{dep}</Text>
          <Text style={s.dateText}>{depDate}</Text>
          <Text style={s.cityText}>{depCity}</Text>
          <Text style={s.fullText}>{depFull}</Text>
          <Text style={s.codeText}>{depCode}</Text>
        </View>

        <View style={s.centreCol}>
          <Text style={s.durationText}>{duration}</Text>
        </View>

        <View style={s.timeColRight}>
          <Text style={[s.timeText, s.alignRight]}>{arr}</Text>
          <Text style={[s.dateText, s.alignRight]}>{arrDate}</Text>
          <Text style={[s.cityText, s.alignRight]}>{arrCity}</Text>
          <Text style={[s.fullText, s.alignRight]}>{arrFull}</Text>
          <Text style={[s.codeText, s.alignRight]}>{arrCode}</Text>
        </View>
      </View>
    </View>
  );
};

/* ─── layover connection box ─── */
const ConnectionBox = ({city, groundTime}) => (
  <View style={s.connBox}>
    <View style={s.connItem}>
      <View style={s.connHeader}>
        <InfoDot />
        <Text style={s.connBold}>Change of planes</Text>
      </View>
      <Text style={s.connSub}>{formatDuration(groundTime)} Layover at {city}</Text>
    </View>
  </View>
);

/* ─── fare details expandable ─── */
const FareDetails = ({flight, fare}) => {
  const penalty = flight?.PenaltyCharges;
  const rules = flight?.MiniFareRules?.[0] ?? [];
  const cur = fare?.Currency || flight?.Fare?.Currency || '';
  return (
    <View style={s.fareDetails}>
      {!!penalty?.ReissueCharge && (
        <View style={s.fareRow}>
          <Text style={s.fareLabel}>Reissue Charge</Text>
          <Text style={s.fareValue}>{penalty.ReissueCharge}</Text>
        </View>
      )}
      {!!penalty?.CancellationCharge && (
        <View style={s.fareRow}>
          <Text style={s.fareLabel}>Cancellation Charge</Text>
          <Text style={s.fareValue}>{penalty.CancellationCharge}</Text>
        </View>
      )}
      {rules.map((r, i) => (
        <View key={i} style={s.fareRow}>
          <Text style={s.fareLabel}>{r.Type}</Text>
          <Text style={s.fareValue}>{r.Details}</Text>
        </View>
      ))}
      <View style={s.fareRow}>
        <Text style={s.fareLabel}>Base Fare</Text>
        <Text style={s.fareValue}>{cur} {formatPrice(fare?.BaseFare ?? flight?.Fare?.BaseFare)}</Text>
      </View>
      <View style={s.fareRow}>
        <Text style={s.fareLabel}>Taxes & Fees</Text>
        <Text style={s.fareValue}>{cur} {formatPrice(fare?.Tax ?? flight?.Fare?.Tax)}</Text>
      </View>
      {!!(fare?.OtherCharges ?? flight?.Fare?.OtherCharges) && (
        <View style={s.fareRow}>
          <Text style={s.fareLabel}>Other Charges</Text>
          <Text style={s.fareValue}>{cur} {formatPrice(fare?.OtherCharges ?? flight?.Fare?.OtherCharges)}</Text>
        </View>
      )}
      <View style={[s.fareRow, s.fareTotal]}>
        <Text style={s.fareTotalLabel}>Total</Text>
        <Text style={s.fareTotalValue}>{cur} {formatPrice(fare?.OfferedFare ?? flight?.Fare?.OfferedFare)}</Text>
      </View>
    </View>
  );
};

/* ─── LCC badge ─── */
const LccBadge = ({isLCC}) => (
  <View style={isLCC ? s.lccBadgeLCC : s.lccBadgeFSC}>
    <Text style={isLCC ? s.lccTextLCC : s.lccTextFSC}>
      {isLCC ? 'LCC' : 'Full Service'}
    </Text>
  </View>
);

/* ════════════ screen ════════════ */
const FlightDetail = ({navigation, route}) => {
  const {
    flight, from, to, departureDate, return_date, passengers, traceId,
    isoneway = 'Yes', isMultiCity = false, legs = [],
  } = route?.params ?? {};

  const isRoundTrip = isoneway === 'No';
  const isMultiLeg  = isRoundTrip || isMultiCity;
console.log('FlightDetail params', route?.params);
  const [wantInsurance, setWantInsurance] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteResultIndex, setQuoteResultIndex] = useState(flight?.ResultIndex);
  const [quoteFare, setQuoteFare] = useState(flight?.Fare ?? {});
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(0); // index into insurancePlans

  const flightLegs  = flight?.Segments ?? [];          // array of segment-arrays, one per leg
  const allSegments = flightLegs.flat();

  const firstSeg = allSegments[0];
  const lastSeg  = allSegments[allSegments.length - 1];

  const headerFrom = firstSeg?.Origin?.Airport?.CityName || stripCode(from) || 'Origin';
  const headerTo   = lastSeg?.Destination?.Airport?.CityName || stripCode(to) || 'Destination';

  const legLabel = (legIdx) => {
    if (isRoundTrip) {return legIdx === 0 ? 'Outbound' : 'Return';}
    if (isMultiCity) {return `Leg ${legIdx + 1}`;}
    return null;
  };

  const price    = quoteFare?.OfferedFare ?? flight?.Fare?.OfferedFare;
  const currency = quoteFare?.Currency ?? flight?.Fare?.Currency ?? 'INR';
  const total    = getTotalPassengers(passengers);

  useEffect(() => {
    Post('flight/fare-quote', {
      ResultIndex: flight?.ResultIndex,
      TraceId: traceId,
    }).then(
      res => {
        setQuoteLoading(false);
        console.log('Fare Quote response', res);
        const response = res?.data?.responseData?.Response;
        const result = response?.Results;
        if (result) {
          if (result.ResultIndex) {setQuoteResultIndex(result.ResultIndex);}
          if (result.Fare) {setQuoteFare(result.Fare);}
        }
        const plans = response?.InsuranceResult?.Results;
        if (plans?.length > 0) {setInsurancePlans(plans);}
      },
      () => setQuoteLoading(false),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const depMoment = firstSeg
    ? moment(firstSeg.Origin.DepTime)
    : (departureDate ? moment(departureDate) : moment());

  const subtitleParts = [depMoment.format('Do MMM')];
  if (isRoundTrip && return_date) {subtitleParts.push(moment(return_date).format('Do MMM'));}
  subtitleParts.push(`${total} Adult${total > 1 ? 's' : ''}`);
  const subtitle = subtitleParts.join('  |  ');

  const tripTypeLabel = isRoundTrip ? 'Round Trip' : isMultiCity ? 'Multi-City' : 'One Way';

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar backgroundColor={Constants.dark_green} barStyle="light-content" />

      {/* header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={s.backBtn}>
          <Text style={s.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <View style={s.headerTextWrap}>
          <Text style={s.headerTitle} numberOfLines={1}>{headerFrom} - {headerTo}</Text>
          <Text style={s.headerSub}>{tripTypeLabel}  |  {subtitle}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── flight segments card ── */}
        <View style={s.card}>
          {/* LCC status row */}
          <View style={s.lccRow}>
            <LccBadge isLCC={flight?.IsLCC} />
            {flight?.ValidatingAirline ? (
              <Text style={s.validatingText}>Validating Airline: {flight.ValidatingAirline}</Text>
            ) : null}
          </View>

          {isMultiLeg ? (
            flightLegs.map((legSegs, legIdx) => (
              <View key={legIdx}>
                {legIdx > 0 && <View style={s.legDivider} />}
                <View style={s.legLabelRow}>
                  <Text style={s.legLabelText}>{legLabel(legIdx)}</Text>
                </View>
                {legSegs.map((seg, segIdx) => (
                  <View key={segIdx}>
                    <Segment seg={seg} />
                    {segIdx < legSegs.length - 1 && (
                      <ConnectionBox
                        city={seg.Destination?.Airport?.CityName || seg.Destination?.Airport?.AirportCode}
                        groundTime={legSegs[segIdx + 1]?.GroundTime || 0}
                      />
                    )}
                  </View>
                ))}
              </View>
            ))
          ) : (
            allSegments.map((seg, idx) => (
              <View key={idx}>
                <Segment seg={seg} />
                {idx < allSegments.length - 1 && (
                  <ConnectionBox
                    city={seg.Destination?.Airport?.CityName || seg.Destination?.Airport?.AirportCode}
                    groundTime={allSegments[idx + 1]?.GroundTime || 0}
                  />
                )}
              </View>
            ))
          )}

          {/* fare details toggle */}
          <TouchableOpacity
            onPress={() => setShowDetails(v => !v)}
            activeOpacity={0.7}
            style={s.viewDetailsBtn}>
            <Text style={s.viewDetailsText}>
              View fare details{'  '}
              <Text style={s.viewArrow}>{showDetails ? '▲' : '▼'}</Text>
            </Text>
          </TouchableOpacity>

          {showDetails && <FareDetails flight={flight} fare={quoteFare} />}
        </View>

        {/* ── insurance card ── */}
        <View style={s.insCard}>
          <Text style={s.insTitle}>Travel Insurance</Text>

          {quoteLoading ? (
            <View style={s.insLoadingRow}>
              <ActivityIndicator size="small" color={Constants.dark_green} />
              <Text style={s.insLoadingText}>Fetching plans…</Text>
            </View>
          ) : insurancePlans.length === 0 ? null : (
            <>
              {/* plan selector chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.planChips}
                style={s.planChipScroll}>
                {insurancePlans.map((plan, i) => (
                  <TouchableOpacity
                    key={plan.InsuranceResultIndex}
                    style={[s.planChip, selectedPlan === i && s.planChipActive]}
                    onPress={() => setSelectedPlan(i)}
                    activeOpacity={0.8}>
                    <Text style={[s.planChipText, selectedPlan === i && s.planChipTextActive]}>
                      {plan.PlanName}
                    </Text>
                    <Text style={[s.planChipPrice, selectedPlan === i && s.planChipTextActive]}>
                      {insurancePlans[i]?.Price?.Currency ?? currency}{' '}
                      {formatPrice(insurancePlans[i]?.Price?.OfferedPrice ?? 0)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* selected plan details */}
              {(() => {
                const plan = insurancePlans[selectedPlan];
                return (
                  <>
                    <View style={s.insSubRow}>
                      <Text style={s.insSub}>Sum insured: {plan.SumInsuredCurrency} {formatPrice(plan.SumInsured)}</Text>
                      <Text style={s.insSub}>per person</Text>
                    </View>

                    <View style={s.benefitList}>
                      {plan.CoverageDetails.map((c, i) => (
                        <View key={i} style={s.benefitRow}>
                          <CheckedBox />
                          <View style={s.benefitTextWrap}>
                            <Text style={s.benefitText}>{c.Coverage}</Text>
                            <Text style={s.benefitAmount}>
                              {c.SumCurrency} {formatPrice(c.SumInsured)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    {!!plan.PoweredBy && (
                      <Text style={s.poweredBy}>{plan.PoweredBy}</Text>
                    )}

                    <TouchableOpacity
                      style={s.consentRow}
                      onPress={() => setWantInsurance(v => !v)}
                      activeOpacity={0.8}>
                      {wantInsurance ? <CheckedBox /> : <UncheckedBox />}
                      <Text style={s.consentText}>
                        Yes, add {plan.PlanName} ({plan.SumInsuredCurrency} {formatPrice(plan.SumInsured)} cover) for my trip.
                      </Text>
                    </TouchableOpacity>
                  </>
                );
              })()}
            </>
          )}
        </View>

        <View style={s.spacer} />
      </ScrollView>

      {/* Book Now bar */}
      <View style={s.bookBar}>
        {price ? (
          <View style={s.bookPriceWrap}>
            <Text style={s.bookPriceAmount}>
              {currency} {formatPrice(
                Number(price) +
                (wantInsurance
                  ? Number(insurancePlans[selectedPlan]?.Price?.OfferedPrice ?? 0)
                  : 0),
              )}
            </Text>
            <Text style={s.bookPriceSub}>
              {wantInsurance ? '/adult + insurance' : '/adult'}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          style={s.bookBtn}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('FlightBooking', {
              flight,
              passengers,
              from,
              to,
              departureDate,
              return_date,
              traceId,
              quoteResultIndex,
              quoteFare,
              wantInsurance,
              insurance: wantInsurance ? insurancePlans[selectedPlan] : null,
              isoneway,
              isMultiCity,
              legs,
            })
          }>
          <Text style={s.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FlightDetail;

/* ════════════ styles ════════════ */
const s = StyleSheet.create({
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
  headerTextWrap: {flex: 1},
  headerTitle: {fontSize: 20, fontFamily: FONTS.Bold, color: Constants.white},
  headerSub: {fontSize: 12, fontFamily: FONTS.Regular, color: 'rgba(255,255,255,0.82)', marginTop: 3},

  scroll: {paddingHorizontal: 12, paddingTop: 12, gap: 12},
  spacer: {height: 120},

  /* flight card */
  card: {
    backgroundColor: Constants.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },

  /* LCC badge */
  lccRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  lccBadgeLCC: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: '#fff3e0'},
  lccBadgeFSC: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: '#e8f5e9'},
  lccTextLCC: {fontSize: 11, fontFamily: FONTS.SemiBold, color: '#e65100'},
  lccTextFSC: {fontSize: 11, fontFamily: FONTS.SemiBold, color: '#2e7d32'},
  validatingText: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3},

  /* dashed line */
  dashedWrap: {flexDirection: 'row', paddingHorizontal: 16, gap: 3},
  dash: {width: 5, height: 1, backgroundColor: '#c8c8c8'},

  /* airline row */
  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  airlineName: {fontSize: 13, fontFamily: FONTS.SemiBold, color: Constants.black, marginLeft: 8},
  flightMeta: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.customgrey3, flex: 1},

  /* leg label (Round Trip / Multi-City) */
  legDivider: {height: 1, backgroundColor: '#e8e8e8', marginHorizontal: 14, marginVertical: 4},
  legLabelRow: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f5f9f5',
  },
  legLabelText: {fontSize: 12, fontFamily: FONTS.SemiBold, color: Constants.dark_green},

  /* baggage row */
  baggageRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  baggageTag: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3},

  /* times row */
  timesRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    alignItems: 'flex-start',
  },
  timeColLeft: {flex: 1.1},
  timeColRight: {flex: 1.1, alignItems: 'flex-end'},
  centreCol: {flex: 0.7, alignItems: 'center', paddingTop: 6},
  timeText: {fontSize: 26, fontFamily: FONTS.Bold, color: Constants.black, lineHeight: 30},
  dateText: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3, marginTop: 3},
  cityText: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.black, marginTop: 2},
  fullText: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.black, marginTop: 1},
  codeText: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3, marginTop: 1},
  durationText: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.customgrey3, textDecorationLine: 'underline', marginTop: 2},
  alignRight: {textAlign: 'right'},

  /* connection box */
  connBox: {
    backgroundColor: '#e8ede9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  connItem: {gap: 3},
  connItemBorder: {borderTopWidth: 1, borderTopColor: '#cdd8ce', paddingTop: 10},
  connHeader: {flexDirection: 'row', alignItems: 'center', gap: 8},
  connBold: {fontSize: 12, fontFamily: FONTS.SemiBold, color: Constants.black},
  connSub: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.black, paddingLeft: 20, lineHeight: 17},

  /* view details */
  viewDetailsBtn: {paddingHorizontal: 14, paddingVertical: 14},
  viewDetailsText: {fontSize: 13, fontFamily: FONTS.Medium, color: Constants.dark_green},
  viewArrow: {fontSize: 10},

  /* fare details */
  fareDetails: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Constants.customgrey5,
  },
  fareRow: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4},
  fareLabel: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  fareValue: {fontSize: 12, fontFamily: FONTS.Medium, color: Constants.black},
  fareTotal: {borderTopWidth: 1, borderTopColor: '#e0e0e0', marginTop: 4, paddingTop: 8},
  fareTotalLabel: {fontSize: 13, fontFamily: FONTS.SemiBold, color: Constants.black},
  fareTotalValue: {fontSize: 13, fontFamily: FONTS.Bold, color: Constants.dark_green},

  /* insurance */
  insCard: {
    backgroundColor: '#edf3ee',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insLoadingRow: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8},
  insLoadingText: {fontSize: 13, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  insTitle: {fontSize: 16, fontFamily: FONTS.Bold, color: Constants.black, marginBottom: 12},

  /* plan chips */
  planChipScroll: {marginBottom: 12},
  planChips: {gap: 8},
  planChip: {
    borderWidth: 1.5,
    borderColor: '#b8d4bb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: Constants.white,
    minWidth: 100,
  },
  planChipActive: {borderColor: Constants.dark_green, backgroundColor: Constants.dark_green},
  planChipText: {fontSize: 12, fontFamily: FONTS.SemiBold, color: Constants.dark_green},
  planChipPrice: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3, marginTop: 2},
  planChipTextActive: {color: Constants.white},

  insSubRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12},
  insSub: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  benefitList: {gap: 10},
  benefitRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 10},
  benefitTextWrap: {flex: 1, flexDirection: 'row', justifyContent: 'space-between'},
  benefitText: {fontSize: 13, fontFamily: FONTS.Regular, color: Constants.black, flex: 1},
  benefitAmount: {fontSize: 12, fontFamily: FONTS.Medium, color: Constants.dark_green},
  poweredBy: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.customgrey3, marginTop: 12, textAlign: 'right'},
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    backgroundColor: Constants.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  consentText: {flex: 1, fontSize: 13, fontFamily: FONTS.Regular, color: Constants.black},

  /* book now bar */
  bookBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Constants.dark_green,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 18,
    gap: 12,
  },
  bookPriceWrap: {flex: 1},
  bookPriceAmount: {fontSize: 18, fontFamily: FONTS.Bold, color: Constants.white},
  bookPriceSub: {fontSize: 11, fontFamily: FONTS.Regular, color: 'rgba(255,255,255,0.75)'},
  bookBtn: {
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: Constants.white,
    paddingVertical: 13,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  bookBtnText: {color: Constants.white, fontSize: 16, fontFamily: FONTS.SemiBold},
});
