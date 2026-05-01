import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import Constants, {FONTS} from '../../Assets/Helpers/constant';
import {Post} from '../../Assets/Helpers/Service';
import {ToastContext} from '../../../App';
import { navigate } from '../../../navigationRef';

const TITLES = ['Mr', 'Mrs', 'Ms', 'Master'];

const COUNTRIES = [
  {code: 'IN', name: 'India'},
  {code: 'US', name: 'United States'},
  {code: 'GB', name: 'United Kingdom'},
  {code: 'AE', name: 'UAE'},
  {code: 'SA', name: 'Saudi Arabia'},
  {code: 'AU', name: 'Australia'},
  {code: 'CA', name: 'Canada'},
  {code: 'SG', name: 'Singapore'},
  {code: 'MY', name: 'Malaysia'},
  {code: 'QA', name: 'Qatar'},
];

const buildInitialPassenger = (index, paxType) => ({
  Title: paxType === 2 ? 'Master' : 'Mr',
  FirstName: '',
  LastName: '',
  PaxType: paxType, // 1=Adult, 2=Child
  DateOfBirth: '',
  Gender: 1, // 1=Male, 2=Female
  PassportNo: '',
  PassportExpiry: '',
  AddressLine1: '',
  AddressLine2: '',
  City: '',
  CountryCode: 'IN',
  CountryName: 'India',
  Nationality: 'IN',
  ContactNo: '',
  Email: '',
  IsLeadPax: index === 0,
});

const buildPassengerList = passengers => {
  const adults = passengers?.adults ?? 1;
  const children = passengers?.children ?? 0;
  const list = [];
  for (let i = 0; i < adults; i++) {list.push(buildInitialPassenger(i, 1));}
  for (let i = 0; i < children; i++) {list.push(buildInitialPassenger(adults + i, 2));}
  return list;
};

/* ── small helpers ── */
const formatPrice = n =>
  Number(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const stripCode = str => (str || '').replace(/\s*\([A-Z]{3}\)/, '').trim();

/* ── Field wrapper ── */
const Field = ({label, children, required}) => (
  <View style={s.fieldWrap}>
    <Text style={s.fieldLabel}>
      {label}
      {required ? <Text style={s.required}> *</Text> : null}
    </Text>
    {children}
  </View>
);

/* ── Gender toggle ── */
const GenderToggle = ({value, onChange}) => (
  <View style={s.genderRow}>
    <TouchableOpacity
      style={[s.genderBtn, value === 1 && s.genderBtnActive]}
      onPress={() => onChange(1)}
      activeOpacity={0.8}>
      <Text style={[s.genderText, value === 1 && s.genderTextActive]}>Male</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[s.genderBtn, value === 2 && s.genderBtnActive]}
      onPress={() => onChange(2)}
      activeOpacity={0.8}>
      <Text style={[s.genderText, value === 2 && s.genderTextActive]}>Female</Text>
    </TouchableOpacity>
  </View>
);

/* ── PassengerForm section ── */
const PassengerForm = ({index, data, onChange, requirePassport, errors}) => {
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showPassportExpPicker, setShowPassportExpPicker] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);

  const set = (key, val) => onChange(index, key, val);

  const paxLabel = data.PaxType === 2
    ? `Child ${index + 1}`
    : `Adult ${index + 1}${data.IsLeadPax ? ' (Lead)' : ''}`;

  return (
    <View style={s.paxCard}>
      <View style={s.paxHeader}>
        <Text style={s.paxTitle}>{paxLabel}</Text>
      </View>

      {/* Title */}
      <Field label="Title" required>
        <TouchableOpacity
          style={s.pickerBtn}
          onPress={() => setShowTitleModal(true)}
          activeOpacity={0.8}>
          <Text style={s.pickerBtnText}>{data.Title}</Text>
          <Text style={s.pickerArrow}>▼</Text>
        </TouchableOpacity>
      </Field>

      {/* Name row */}
      <View style={s.row}>
        <View style={s.halfField}>
          <Text style={s.fieldLabel}>First Name <Text style={s.required}>*</Text></Text>
          <TextInput
            style={[s.input, errors?.FirstName && s.inputError]}
            value={data.FirstName}
            onChangeText={v => set('FirstName', v)}
            placeholder="First name"
            placeholderTextColor="#b0b0b0"
            autoCapitalize="words"
          />
          {errors?.FirstName ? <Text style={s.errorText}>{errors.FirstName}</Text> : null}
        </View>
        <View style={s.halfField}>
          <Text style={s.fieldLabel}>Last Name <Text style={s.required}>*</Text></Text>
          <TextInput
            style={[s.input, errors?.LastName && s.inputError]}
            value={data.LastName}
            onChangeText={v => set('LastName', v)}
            placeholder="Last name"
            placeholderTextColor="#b0b0b0"
            autoCapitalize="words"
          />
          {errors?.LastName ? <Text style={s.errorText}>{errors.LastName}</Text> : null}
        </View>
      </View>

      {/* Gender */}
      <Field label="Gender" required>
        <GenderToggle value={data.Gender} onChange={v => set('Gender', v)} />
      </Field>

      {/* Date of Birth */}
      <Field label="Date of Birth" required>
        <TouchableOpacity
          style={[s.pickerBtn, errors?.DateOfBirth && s.inputError]}
          onPress={() => setShowDobPicker(true)}
          activeOpacity={0.8}>
          <Text style={[s.pickerBtnText, !data.DateOfBirth && {color: '#b0b0b0'}]}>
            {data.DateOfBirth
              ? moment(data.DateOfBirth).format('DD MMM YYYY')
              : 'Select date of birth'}
          </Text>
          <Text style={s.pickerArrow}>▼</Text>
        </TouchableOpacity>
        {errors?.DateOfBirth ? <Text style={s.errorText}>{errors.DateOfBirth}</Text> : null}
      </Field>

      {/* Passport fields — international only */}
      {requirePassport ? (
        <>
          <Field label="Passport Number" required>
            <TextInput
              style={[s.input, errors?.PassportNo && s.inputError]}
              value={data.PassportNo}
              onChangeText={v => set('PassportNo', v.toUpperCase())}
              placeholder="e.g. A1234567"
              placeholderTextColor="#b0b0b0"
              autoCapitalize="characters"
            />
            {errors?.PassportNo ? <Text style={s.errorText}>{errors.PassportNo}</Text> : null}
          </Field>
          <Field label="Passport Expiry" required>
            <TouchableOpacity
              style={[s.pickerBtn, errors?.PassportExpiry && s.inputError]}
              onPress={() => setShowPassportExpPicker(true)}
              activeOpacity={0.8}>
              <Text style={[s.pickerBtnText, !data.PassportExpiry && {color: '#b0b0b0'}]}>
                {data.PassportExpiry
                  ? moment(data.PassportExpiry).format('DD MMM YYYY')
                  : 'Select expiry date'}
              </Text>
              <Text style={s.pickerArrow}>▼</Text>
            </TouchableOpacity>
            {errors?.PassportExpiry ? <Text style={s.errorText}>{errors.PassportExpiry}</Text> : null}
          </Field>
          <Field label="Nationality" required>
            <TouchableOpacity
              style={s.pickerBtn}
              onPress={() => setShowCountryModal(true)}
              activeOpacity={0.8}>
              <Text style={s.pickerBtnText}>
                {COUNTRIES.find(c => c.code === data.Nationality)?.name || data.Nationality}
              </Text>
              <Text style={s.pickerArrow}>▼</Text>
            </TouchableOpacity>
          </Field>
        </>
      ) : null}

      {/* Lead passenger contact info */}
      {data.IsLeadPax ? (
        <>
          <View style={s.leadDivider}>
            <Text style={s.leadDividerText}>Contact Details</Text>
          </View>
          <Field label="Mobile Number" required>
            <TextInput
              style={[s.input, errors?.ContactNo && s.inputError]}
              value={data.ContactNo}
              onChangeText={v => set('ContactNo', v)}
              placeholder="10-digit mobile number"
              placeholderTextColor="#b0b0b0"
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
            {errors?.ContactNo ? <Text style={s.errorText}>{errors.ContactNo}</Text> : null}
          </Field>
          <Field label="Email Address" required>
            <TextInput
              style={[s.input, errors?.Email && s.inputError]}
              value={data.Email}
              onChangeText={v => set('Email', v)}
              placeholder="email@example.com"
              placeholderTextColor="#b0b0b0"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors?.Email ? <Text style={s.errorText}>{errors.Email}</Text> : null}
          </Field>
          {/* Address — required for all flights */}
          <Field label="Address Line 1" required>
            <TextInput
              style={[s.input, errors?.AddressLine1 && s.inputError]}
              value={data.AddressLine1}
              onChangeText={v => set('AddressLine1', v)}
              placeholder="Street address"
              placeholderTextColor="#b0b0b0"
            />
            {errors?.AddressLine1 ? <Text style={s.errorText}>{errors.AddressLine1}</Text> : null}
          </Field>
          <View style={s.row}>
            <View style={s.halfField}>
              <Text style={s.fieldLabel}>City <Text style={s.required}>*</Text></Text>
              <TextInput
                style={[s.input, errors?.City && s.inputError]}
                value={data.City}
                onChangeText={v => set('City', v)}
                placeholder="City"
                placeholderTextColor="#b0b0b0"
              />
              {errors?.City ? <Text style={s.errorText}>{errors.City}</Text> : null}
            </View>
            <View style={s.halfField}>
              <Text style={s.fieldLabel}>Country</Text>
              <TouchableOpacity
                style={s.pickerBtn}
                onPress={() => setShowCountryModal(true)}
                activeOpacity={0.8}>
                <Text style={s.pickerBtnText}>
                  {COUNTRIES.find(c => c.code === data.CountryCode)?.name || data.CountryCode}
                </Text>
                <Text style={s.pickerArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.cardBottomPad} />
        </>
      ) : null}

      {/* Title modal */}
      <Modal visible={showTitleModal} transparent animationType="fade">
        <TouchableOpacity
          style={s.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowTitleModal(false)}>
          <View style={s.optionSheet}>
            <Text style={s.sheetTitle}>Select Title</Text>
            {TITLES.map(t => (
              <TouchableOpacity
                key={t}
                style={[s.sheetOption, data.Title === t && s.sheetOptionActive]}
                onPress={() => {set('Title', t); setShowTitleModal(false);}}>
                <Text style={[s.sheetOptionText, data.Title === t && s.sheetOptionTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Country modal */}
      <Modal visible={showCountryModal} transparent animationType="fade">
        <TouchableOpacity
          style={s.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowCountryModal(false)}>
          <View style={s.optionSheet}>
            <Text style={s.sheetTitle}>Select Country</Text>
            <ScrollView>
              {COUNTRIES.map(c => (
                <TouchableOpacity
                  key={c.code}
                  style={[s.sheetOption, data.CountryCode === c.code && s.sheetOptionActive]}
                  onPress={() => {
                    set('CountryCode', c.code);
                    set('CountryName', c.name);
                    set('Nationality', c.code);
                    setShowCountryModal(false);
                  }}>
                  <Text style={[s.sheetOptionText, data.CountryCode === c.code && s.sheetOptionTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* DOB picker */}
      <DateTimePickerModal
        isVisible={showDobPicker}
        mode="date"
        maximumDate={new Date()}
        date={data.DateOfBirth ? new Date(data.DateOfBirth) : new Date(2000, 0, 1)}
        onConfirm={date => {
          set('DateOfBirth', moment(date).format('YYYY-MM-DD'));
          setShowDobPicker(false);
        }}
        onCancel={() => setShowDobPicker(false)}
      />

      {/* Passport expiry picker */}
      <DateTimePickerModal
        isVisible={showPassportExpPicker}
        mode="date"
        minimumDate={new Date()}
        date={data.PassportExpiry ? new Date(data.PassportExpiry) : new Date()}
        onConfirm={date => {
          set('PassportExpiry', moment(date).format('YYYY-MM-DD'));
          setShowPassportExpPicker(false);
        }}
        onCancel={() => setShowPassportExpPicker(false)}
      />
    </View>
  );
};

/* ════════════ screen ════════════ */
const FlightBooking = ({navigation, route}) => {
  const {
    flight, passengers, from, to, departureDate, return_date, traceId,
    quoteResultIndex: preQuoteResultIndex,
    quoteFare: preQuoteFare,
    wantInsurance = false,
    insurance = null,
    isoneway: paramIsoneway,
    isMultiCity = false,
    legs = [],
  } = route?.params ?? {};

  // fare-quote was already called in FlightDetail — use those results directly
  const alreadyQuoted = !!preQuoteResultIndex;
  const [, setToast] = useContext(ToastContext);

  const requirePassport = flight?.IsPassportRequiredAtBook ?? false;
  const isoneway = paramIsoneway ?? (flight?.Segments?.length === 1 ? 'Yes' : 'No');
  const isDomestic = !requirePassport;
  const isRoundTrip = isoneway === 'No';
  const tripTypeLabel = isMultiCity ? 'Multi-City' : isRoundTrip ? 'Round Trip' : 'One Way';

  const isGSTMandatory = flight?.IsGSTMandatory ?? false;

  const [paxList, setPaxList] = useState(() => buildPassengerList(passengers));
  const [fieldErrors, setFieldErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [gst, setGst] = useState({
    number: '',
    companyName: '',
    companyAddress: '',
    phone: '',
    email: '',
  });
  const [gstErrors, setGstErrors] = useState({});
  // initialise from FlightDetail's already-completed fare-quote if available
  const [quoteLoading, setQuoteLoading] = useState(!alreadyQuoted);
  const [quoteFare, setQuoteFare] = useState(preQuoteFare ?? flight?.Fare ?? {});
  const [quoteResultIndex, setQuoteResultIndex] = useState(preQuoteResultIndex ?? flight?.ResultIndex);
  const [quoteError, setQuoteError] = useState(null);

  // only call fare-quote if FlightDetail didn't already do it
  useEffect(() => {
    if (alreadyQuoted) {return;}
    Post('flight/fare-quote', {
      ResultIndex: flight?.ResultIndex,
      TraceId: traceId,
    }).then(
      res => {
        setQuoteLoading(false);
        const result = res?.data?.responseData?.Response?.Results;
        if (result) {
          if (result.Fare) {setQuoteFare(result.Fare);}
          if (result.ResultIndex) {setQuoteResultIndex(result.ResultIndex);}
        } else {
          setQuoteError(
            res?.data?.responseData?.Response?.Error?.ErrorMessage ||
            'Unable to confirm fare. Please go back and try again.',
          );
        }
      },
      () => {
        setQuoteLoading(false);
        setQuoteError('Unable to reach the server. Please go back and try again.');
      },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flightPrice = quoteFare?.OfferedFare ?? flight?.Fare?.OfferedFare ?? 0;
  const insurancePremium = wantInsurance ? Number(insurance?.Price?.OfferedPrice ?? 0) : 0;
  const price = Number(flightPrice) + insurancePremium;
  const currency = quoteFare?.Currency ?? flight?.Fare?.Currency ?? 'INR';

  const headerFrom = isMultiCity
    ? (legs[0]?.from ? stripCode(legs[0].from) : 'Origin')
    : (from ? stripCode(from) : 'Origin');
  const headerTo = isMultiCity
    ? (legs[legs.length - 1]?.to ? stripCode(legs[legs.length - 1].to) : 'Destination')
    : (to ? stripCode(to) : 'Destination');

  const handleChange = (index, key, value) => {
    setPaxList(prev => {
      const updated = [...prev];
      updated[index] = {...updated[index], [key]: value};
      return updated;
    });
    // clear field error on change
    setFieldErrors(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {...updated[index], [key]: undefined};
      }
      return updated;
    });
  };

  const validate = () => {
    const errors = paxList.map((p, i) => {
      const e = {};
      if (!p.FirstName.trim()) {e.FirstName = 'Required';}
      if (!p.LastName.trim()) {e.LastName = 'Required';}
      if (!p.DateOfBirth) {e.DateOfBirth = 'Required';}
      if (requirePassport) {
        if (!p.PassportNo.trim()) {e.PassportNo = 'Required';}
        if (!p.PassportExpiry) {e.PassportExpiry = 'Required';}
      }
      if (p.IsLeadPax) {
        if (!p.ContactNo.trim()) {e.ContactNo = 'Required';}
        if (!p.Email.trim()) {e.Email = 'Required';}
        else if (!/\S+@\S+\.\S+/.test(p.Email)) {e.Email = 'Invalid email';}
        if (!p.AddressLine1.trim()) {e.AddressLine1 = 'Required';}
        if (!p.City.trim()) {e.City = 'Required';}
      }
      return e;
    });
    const paxHasErrors = errors.some(e => Object.keys(e).length > 0);
    setFieldErrors(errors);

    // GST validation
    const ge = {};
    if (isGSTMandatory) {
      if (!gst.number.trim()) {ge.number = 'Required';}
      if (!gst.companyName.trim()) {ge.companyName = 'Required';}
      if (!gst.companyAddress.trim()) {ge.companyAddress = 'Required';}
      if (!gst.phone.trim()) {ge.phone = 'Required';}
      if (!gst.email.trim()) {ge.email = 'Required';}
    }
    setGstErrors(ge);

    return !paxHasErrors && Object.keys(ge).length === 0;
  };

  const handleBook = () => {
    if (!validate()) {
      setToast('Please fill all required fields');
      return;
    }

    const payload = {
      ResultIndex: quoteResultIndex,
      TraceId: traceId,
      IsLCC: String(Number(flight?.IsLCC ?? false)),   // "1" or "0"
      isoneway,                                         // "Yes" or "No"
      isDomestic: isDomestic ? 'Yes' : 'No',
      IsDomesticReturn: 'Yes',
      ...(isGSTMandatory && {
        GSTNumber: gst.number,
        GSTCompanyName: gst.companyName,
        GSTCompanyAddress: gst.companyAddress,
        GSTPhoneNumber: gst.phone,
        GSTEmail: gst.email,
      }),
      Passengers: paxList.map(p => ({
        Title: p.Title,
        FirstName: p.FirstName.trim(),
        LastName: p.LastName.trim(),
        PaxType: String(p.PaxType),                    // "1" or "2"
        DateOfBirth: p.DateOfBirth
          ? `${p.DateOfBirth}T00:00:00`                // "1995-07-17T00:00:00"
          : undefined,
        Gender: p.Gender,
        ContactNo: p.ContactNo,
        Email: p.Email,
        IsLeadPax: p.IsLeadPax,
        AddressLine1: p.AddressLine1,
        AddressLine2: p.AddressLine2,
        City: p.City,
        CountryCode: p.CountryCode,
        CountryName: p.CountryName,
        Nationality: p.Nationality,
        ...(requirePassport && {
          PassportNo: p.PassportNo,
          PassportExpiry: p.PassportExpiry
            ? `${p.PassportExpiry}T00:00:00`
            : undefined,
        }),
        Fare: quoteFare,
        Baggage: [],
        MealDynamic: [],
        SeatDynamic: [],
      })),
    };

    setSubmitting(true);
    Post('flight/book', payload).then(
      res => {
        setSubmitting(false);
        console.log('Booking response:', res);
          const responseFlights = res?.data?.responseData?.Response;
         if (res.status && responseFlights.Error.ErrorCode === 0) {
          setToast('Booking confirmed!');
         navigate("Flighttab",{screen:'FlightHome'});
        }else{
           setToast(responseFlights.Error.ErrorMessage|| 'Booking failed. Please try again.');
        }
      },
      err => {
        setSubmitting(false);
        setToast(err?.message || 'Something went wrong. Please try again.');
      },
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar backgroundColor={Constants.dark_green} barStyle="light-content" />

      {/* header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={s.backBtn}>
          <Text style={s.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <View style={s.headerTextWrap}>
          <Text style={s.headerTitle} numberOfLines={1}>
            {headerFrom} → {headerTo}
          </Text>
          <Text style={s.headerSub}>{tripTypeLabel}  ·  Passenger Details</Text>
        </View>
      </View>

      {/* fare-quote loading overlay */}
      {quoteLoading ? (
        <View style={s.quoteOverlay}>
          <ActivityIndicator size="large" color={Constants.dark_green} />
          <Text style={s.quoteLoadingText}>Confirming fare…</Text>
        </View>
      ) : quoteError ? (
        <View style={s.quoteOverlay}>
          <Text style={s.quoteErrorText}>{quoteError}</Text>
          <TouchableOpacity style={s.quoteRetryBtn} onPress={() => navigation.goBack()}>
            <Text style={s.quoteRetryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled">

          {/* fare summary */}
          <View style={s.summaryCard}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Flight</Text>
              <Text style={s.summaryValue} numberOfLines={1}>
                {headerFrom} → {headerTo}
              </Text>
            </View>
            {isMultiCity && legs.length > 0 ? (
              legs.map((leg, i) => (
                <View key={i} style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Leg {i + 1}</Text>
                  <Text style={s.summaryValue}>
                    {stripCode(leg.from)} → {stripCode(leg.to)}
                    {leg.date ? `  ·  ${moment(leg.date).format('Do MMM')}` : ''}
                  </Text>
                </View>
              ))
            ) : (
              <>
                {departureDate ? (
                  <View style={s.summaryRow}>
                    <Text style={s.summaryLabel}>Departure</Text>
                    <Text style={s.summaryValue}>{moment(departureDate).format('Do MMM YYYY')}</Text>
                  </View>
                ) : null}
                {isRoundTrip && return_date ? (
                  <View style={s.summaryRow}>
                    <Text style={s.summaryLabel}>Return</Text>
                    <Text style={s.summaryValue}>{moment(return_date).format('Do MMM YYYY')}</Text>
                  </View>
                ) : null}
              </>
            )}
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Passengers</Text>
              <Text style={s.summaryValue}>
                {[
                  passengers?.adults ? `${passengers.adults} Adult${passengers.adults > 1 ? 's' : ''}` : null,
                  passengers?.children ? `${passengers.children} Child${passengers.children > 1 ? 'ren' : ''}` : null,
                ].filter(Boolean).join(', ')}
              </Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Flight Fare</Text>
              <Text style={s.summaryValue}>{currency} {formatPrice(flightPrice)}</Text>
            </View>
            {wantInsurance && insurancePremium > 0 ? (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>
                  Insurance ({insurance?.PlanName || 'Travel Insurance'})
                </Text>
                <Text style={s.summaryValue}>{currency} {formatPrice(insurancePremium)}</Text>
              </View>
            ) : null}
            {price ? (
              <View style={[s.summaryRow, s.summaryTotal]}>
                <Text style={s.summaryTotalLabel}>Total</Text>
                <Text style={s.summaryTotalValue}>{currency} {formatPrice(price)}</Text>
              </View>
            ) : null}
          </View>

          {/* passenger forms */}
          {paxList.map((pax, i) => (
            <PassengerForm
              key={i}
              index={i}
              data={pax}
              onChange={handleChange}
              requirePassport={requirePassport}
              errors={fieldErrors[i]}
            />
          ))}

          {/* GST details — shown only when IsGSTMandatory */}
          {isGSTMandatory ? (
            <View style={s.paxCard}>
              <View style={s.paxHeader}>
                <Text style={s.paxTitle}>GST Details</Text>
              </View>

              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>GST Number <Text style={s.required}>*</Text></Text>
                <TextInput
                  style={[s.input, gstErrors.number && s.inputError]}
                  value={gst.number}
                  onChangeText={v => {
                    setGst(prev => ({...prev, number: v.toUpperCase()}));
                    setGstErrors(prev => ({...prev, number: undefined}));
                  }}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  placeholderTextColor="#b0b0b0"
                  autoCapitalize="characters"
                />
                {gstErrors.number ? <Text style={s.errorText}>{gstErrors.number}</Text> : null}
              </View>

              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Company Name <Text style={s.required}>*</Text></Text>
                <TextInput
                  style={[s.input, gstErrors.companyName && s.inputError]}
                  value={gst.companyName}
                  onChangeText={v => {
                    setGst(prev => ({...prev, companyName: v}));
                    setGstErrors(prev => ({...prev, companyName: undefined}));
                  }}
                  placeholder="Registered company name"
                  placeholderTextColor="#b0b0b0"
                />
                {gstErrors.companyName ? <Text style={s.errorText}>{gstErrors.companyName}</Text> : null}
              </View>

              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Company Address <Text style={s.required}>*</Text></Text>
                <TextInput
                  style={[s.input, gstErrors.companyAddress && s.inputError]}
                  value={gst.companyAddress}
                  onChangeText={v => {
                    setGst(prev => ({...prev, companyAddress: v}));
                    setGstErrors(prev => ({...prev, companyAddress: undefined}));
                  }}
                  placeholder="Registered address"
                  placeholderTextColor="#b0b0b0"
                />
                {gstErrors.companyAddress ? <Text style={s.errorText}>{gstErrors.companyAddress}</Text> : null}
              </View>

              <View style={s.row}>
                <View style={s.halfField}>
                  <Text style={s.fieldLabel}>Phone <Text style={s.required}>*</Text></Text>
                  <TextInput
                    style={[s.input, gstErrors.phone && s.inputError]}
                    value={gst.phone}
                    onChangeText={v => {
                      setGst(prev => ({...prev, phone: v}));
                      setGstErrors(prev => ({...prev, phone: undefined}));
                    }}
                    placeholder="Contact number"
                    placeholderTextColor="#b0b0b0"
                    keyboardType="phone-pad"
                  />
                  {gstErrors.phone ? <Text style={s.errorText}>{gstErrors.phone}</Text> : null}
                </View>
                <View style={s.halfField}>
                  <Text style={s.fieldLabel}>Email <Text style={s.required}>*</Text></Text>
                  <TextInput
                    style={[s.input, gstErrors.email && s.inputError]}
                    value={gst.email}
                    onChangeText={v => {
                      setGst(prev => ({...prev, email: v}));
                      setGstErrors(prev => ({...prev, email: undefined}));
                    }}
                    placeholder="company@email.com"
                    placeholderTextColor="#b0b0b0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {gstErrors.email ? <Text style={s.errorText}>{gstErrors.email}</Text> : null}
                </View>
              </View>

              <View style={s.cardBottomPad} />
            </View>
          ) : null}

          <View style={s.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Book bar */}
      <View style={s.bookBar}>
        {price ? (
          <View style={s.bookPriceWrap}>
            <Text style={s.bookPriceAmount}>{currency} {formatPrice(price)}</Text>
            <Text style={s.bookPriceSub}>
              {wantInsurance ? '/adult · incl. insurance' : '/adult'}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          style={[s.bookBtn, submitting && s.bookBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleBook}
          disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={Constants.white} />
          ) : (
            <Text style={s.bookBtnText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FlightBooking;

/* ════════════ styles ════════════ */
const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f2f2f2'},

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
  headerTitle: {fontSize: 18, fontFamily: FONTS.Bold, color: Constants.white},
  headerSub: {fontSize: 12, fontFamily: FONTS.Regular, color: 'rgba(255,255,255,0.82)', marginTop: 2},

  scroll: {paddingHorizontal: 12, paddingTop: 12, gap: 12},
  spacer: {height: 120},

  /* fare summary card */
  summaryCard: {
    backgroundColor: Constants.white,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  summaryLabel: {fontSize: 13, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  summaryValue: {fontSize: 13, fontFamily: FONTS.Medium, color: Constants.black, flex: 1, textAlign: 'right'},
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    marginTop: 4,
    paddingTop: 10,
  },
  summaryTotalLabel: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.black},
  summaryTotalValue: {fontSize: 16, fontFamily: FONTS.Bold, color: Constants.dark_green},

  /* passenger card */
  paxCard: {
    backgroundColor: Constants.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  paxHeader: {
    backgroundColor: Constants.dark_green,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  paxTitle: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.white},

  /* fields */
  fieldWrap: {paddingHorizontal: 16, paddingTop: 12},
  fieldLabel: {fontSize: 12, fontFamily: FONTS.Medium, color: Constants.customgrey3, marginBottom: 6},
  required: {color: '#e53935'},
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 14,
    fontFamily: FONTS.Regular,
    color: Constants.black,
    backgroundColor: '#fafafa',
  },
  inputError: {borderColor: '#e53935'},
  errorText: {fontSize: 11, fontFamily: FONTS.Regular, color: '#e53935', marginTop: 3},

  /* row layout */
  row: {flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 10},
  halfField: {flex: 1},

  /* picker button */
  pickerBtn: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  pickerBtnText: {fontSize: 14, fontFamily: FONTS.Regular, color: Constants.black},
  pickerArrow: {fontSize: 11, color: Constants.customgrey3},

  /* gender toggle */
  genderRow: {flexDirection: 'row', gap: 10},
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  genderBtnActive: {borderColor: Constants.dark_green, backgroundColor: '#edf3ee'},
  genderText: {fontSize: 14, fontFamily: FONTS.Regular, color: Constants.customgrey3},
  genderTextActive: {fontFamily: FONTS.SemiBold, color: Constants.dark_green},

  /* lead pax divider */
  leadDivider: {
    marginTop: 14,
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginBottom: -4,
  },
  leadDividerText: {fontSize: 13, fontFamily: FONTS.SemiBold, color: Constants.dark_green},

  /* modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  optionSheet: {
    backgroundColor: Constants.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '60%',
  },
  sheetTitle: {
    fontSize: 15,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sheetOption: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  sheetOptionActive: {backgroundColor: '#edf3ee'},
  sheetOptionText: {fontSize: 14, fontFamily: FONTS.Regular, color: Constants.black},
  sheetOptionTextActive: {fontFamily: FONTS.SemiBold, color: Constants.dark_green},

  /* book bar */
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
    paddingHorizontal: 24,
    alignItems: 'center',
    minWidth: 150,
  },
  cardBottomPad: {height: 14},
  bookBtnDisabled: {opacity: 0.6},
  bookBtnText: {color: Constants.white, fontSize: 15, fontFamily: FONTS.SemiBold},

  /* fare-quote overlay */
  quoteOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  quoteLoadingText: {fontSize: 15, fontFamily: FONTS.Medium, color: Constants.dark_green, marginTop: 10},
  quoteErrorText: {fontSize: 14, fontFamily: FONTS.Regular, color: '#c62828', textAlign: 'center', paddingHorizontal: 32},
  quoteRetryBtn: {
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: Constants.dark_green,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  quoteRetryText: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.white},
});
