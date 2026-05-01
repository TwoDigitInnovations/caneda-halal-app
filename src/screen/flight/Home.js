import React, {useState, useRef, useEffect, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Constants, {FONTS} from '../../Assets/Helpers/constant';
import {CalenderIcon} from '../../../Theme';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {GetApi} from '../../Assets/Helpers/Service';
import { ToastContext } from '../../../App';

const TABS = ['One way', 'Round Trip', 'Multi-City'];

const PASSENGER_TYPES = [
  {key: 'adults', label: 'Adult(s)', min: 1},
  {key: 'children', label: 'Child( 2-11 )', min: 0},
  {key: 'infantOnSeat', label: 'Infant on seat\n(under 2)', min: 0},
  {key: 'infantOnLap', label: 'Infant on lap\n(under 2)', min: 0},
];

const CABIN_CLASSES = [
  {label: 'All', value: 1, slug: 'all'},
  {label: 'Economy', value: 2, slug: 'economy'},
  {label: 'Premium Economy', value: 3, slug: 'premiumEconomy'},
  {label: 'Business', value: 4, slug: 'business'},
  {label: 'Premium Business', value: 5, slug: 'premiumBusiness'},
  {label: 'First', value: 6, slug: 'first'},

];


const buildSchema = isRoundTrip =>
  Yup.object({
    from: Yup.string().trim().required('Origin is required'),
    to: Yup.string()
      .trim()
      .required('Destination is required')
      .test('not-same', 'Origin and destination must differ', function (val) {
        return val?.toLowerCase() !== this.parent.from?.toLowerCase();
      }),
    departureDate: Yup.date().nullable().required('Departure date is required'),
    returnDate: isRoundTrip
      ? Yup.date()
          .nullable()
          .required('Return date is required')
          .min(Yup.ref('departureDate'), 'Return must be after departure')
      : Yup.date().nullable(),
    adults: Yup.number().min(1, 'At least 1 adult required').required(),
    children: Yup.number().min(0).required(),
    infantOnSeat: Yup.number().min(0).required(),
    infantOnLap: Yup.number().min(0).required(),
  });

const getTravelerSummary = values => {
  const parts = [];
  if (values.adults > 0)
    parts.push(`${values.adults} Adult${values.adults > 1 ? 's' : ''}`);
  if (values.children > 0)
    parts.push(`${values.children} Child${values.children > 1 ? 'ren' : ''}`);
  if (values.infantOnSeat > 0) parts.push(`${values.infantOnSeat} Infant(seat)`);
  if (values.infantOnLap > 0) parts.push(`${values.infantOnLap} Infant(lap)`);
  return parts.join(', ') || '1 Adult';
};

const SwapIcon = () => (
  <View style={styles.swapBtn}>
    <Text style={styles.swapArrow}>⇅</Text>
  </View>
);

const PassengerCounter = ({label, value, onIncrease, onDecrease, min}) => (
  <View style={styles.passengerRow}>
    <Text style={styles.passengerLabel}>{label}</Text>
    <View style={styles.counterPill}>
      <TouchableOpacity style={styles.pillBtn} onPress={onIncrease} activeOpacity={0.7}>
        <Text style={styles.pillBtnText}>+</Text>
      </TouchableOpacity>
      <Text style={styles.pillCount}>{value}</Text>
      <TouchableOpacity
        style={[styles.pillBtn, value <= min && styles.pillBtnDisabled]}
        onPress={onDecrease}
        disabled={value <= min}
        activeOpacity={0.7}>
        <Text style={[styles.pillBtnText, value <= min && styles.pillBtnTextDisabled]}>
          −
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const TravelersModal = ({visible, values, onChangePassenger, onClose}) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
    statusBarTranslucent>
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback>
          <View style={styles.modalCard}>
            {PASSENGER_TYPES.map(pt => (
              <PassengerCounter
                key={pt.key}
                label={pt.label}
                value={values[pt.key]}
                min={pt.min}
                onIncrease={() => onChangePassenger(pt.key, 1, pt.min)}
                onDecrease={() => onChangePassenger(pt.key, -1, pt.min)}
              />
            ))}
            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const TravelersField = ({style, values, onOpen}) => (
  <TouchableOpacity style={style} onPress={onOpen} activeOpacity={0.8}>
    <Text style={styles.fieldLabel}>Traveler(s)</Text>
    <View style={styles.fieldRow}>
      <Text style={styles.fieldValue} numberOfLines={1}>
        {getTravelerSummary(values)}
      </Text>
      <Text style={styles.dropArrow}>▼</Text>
    </View>
  </TouchableOpacity>
);

const LocationSearch = ({label, value, onSelect, onBlur, error, touched}) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);


  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const fetchLocations = async text => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
  
       GetApi(`flight/locations?term=${text}`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
           const list = Array.isArray(res?.data?.airports) ? res.data.airports : [];
        setSuggestions(list);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const onChange = text => {
    setQuery(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchLocations(text), 350);
  };

  const onItemPress = item => {
    const display = `${item.CityName} (${item.code})`;
    setQuery(display);
    onSelect(display);
    setSuggestions([]);
    setFocused(false);
  };

  const showDropdown = focused && (loading || suggestions.length > 0);

  return (
    <View style={focused ? styles.locationWrapperFocused : styles.locationWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, touched && error && styles.inputError]}
        placeholder="City or airport"
        placeholderTextColor={Constants.customgrey3}
        value={query}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          onBlur?.();
          setTimeout(() => {
            setFocused(false);
            setSuggestions([]);
          }, 200);
        }}
        returnKeyType="done"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {touched && !!error && <Text style={styles.errorText}>{error}</Text>}
      {showDropdown && (
        <View style={styles.dropdown}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={Constants.dark_green}
              style={styles.dropLoader}
            />
          ) : (
            suggestions.map((item, i) => (
              <TouchableOpacity
                key={`${item.code}-${i}`}
                style={[styles.dropItem, i > 0 && styles.dropDivider]}
                onPress={() => onItemPress(item)}
                activeOpacity={0.7}>
                <View style={styles.dropRow}>
                  <Text style={styles.dropCity}>{item.CityName}</Text>
                  <Text style={styles.dropCode}>{item.code}</Text>
                </View>
                <Text style={styles.dropAirport} numberOfLines={1}>
                  {item.name}{item.CountryName ? `, ${item.CountryName}` : ''}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const INIT_LEGS = () => [
  {from: '', to: '', date: null},
  {from: '', to: '', date: null},
];

const MultiCityLeg = ({leg, index, legError, onUpdate, onRemove, showRemove, onOpenDate}) => (
  <View style={styles.legCard}>
    <View style={styles.legHeader}>
      <Text style={styles.legLabel}>Flight {index + 1}</Text>
      {showRemove && (
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove} activeOpacity={0.7}>
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.legRoute}>
      <LocationSearch
        label="From"
        value={leg.from}
        onSelect={val => onUpdate('from', val)}
        error={legError?.from}
        touched={!!legError?.from}
      />
      <View style={styles.divider} />
      <LocationSearch
        label="To"
        value={leg.to}
        onSelect={val => onUpdate('to', val)}
        error={legError?.to}
        touched={!!legError?.to}
      />
    </View>
    <TouchableOpacity
      style={[styles.legDateField, legError?.date && styles.fieldError]}
      onPress={onOpenDate}
      activeOpacity={0.8}>
      <Text style={styles.fieldLabel}>Date</Text>
      <View style={styles.fieldRow}>
        <Text style={[styles.fieldValue, !leg.date && styles.placeholder]}>
          {leg.date ? moment(leg.date).format('DD/MM/YYYY') : 'DD/MM/YYYY'}
        </Text>
        <CalenderIcon height={20} width={20} />
      </View>
      {legError?.date ? <Text style={styles.errorText}>{legError.date}</Text> : null}
    </TouchableOpacity>
  </View>
);

const FlightHome = ({navigation}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [showTravelerModal, setShowTravelerModal] = useState(false);
  const [showCabinModal, setShowCabinModal] = useState(false);

  const [cabinClass, setCabinClass] = useState(1);
  const selectedCabin = CABIN_CLASSES.find(c => c.value === cabinClass) ?? CABIN_CLASSES[1];

  /* multi-city */
  const [legs, setLegs] = useState(INIT_LEGS());
  const [legDatePickerIndex, setLegDatePickerIndex] = useState(null);
  const [legErrors, setLegErrors] = useState([]);

  const isRoundTrip = activeTab === 1;
  const isMultiCity = activeTab === 2;

  const formik = useFormik({
    initialValues: {
      from: '',
      to: '',
      departureDate: null,
      returnDate: null,
      adults: 1,
      children: 0,
      infantOnSeat: 0,
      infantOnLap: 0,
    },
    validationSchema: buildSchema(isRoundTrip),
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: values => {
      const extractCode = str => {
        const match = str.match(/\(([A-Z]{3})\)/);
        return match ? match[1] : str.trim().toUpperCase().slice(0, 3);
      };
      console.log(legs)
      navigation.navigate('FlightResults', {
        from: values.from,
        to: values.to,
        fromCode: extractCode(values.from),
        toCode: extractCode(values.to),
        departureDate: values.departureDate,
        return_date: values.returnDate,
        isoneway: activeTab === 0 ? 'Yes' : 'No',
        cabinClass,
         category: CABIN_CLASSES.find(c => c.value === cabinClass) || {},
        passengers: {
          adults: values.adults,
          children: values.children,
          infantOnSeat: values.infantOnSeat,
          infantOnLap: values.infantOnLap,
        },
      });
    },
  });

  const {values, errors, touched, setFieldValue, setFieldTouched, handleSubmit} = formik;

  const handleSwap = () => {
    const temp = values.from;
    setFieldValue('from', values.to);
    setFieldValue('to', temp);
  };

  const changePassenger = (key, delta, min) => {
    setFieldValue(key, Math.max(min, values[key] + delta));
  };

  const handleTabChange = tab => {
    setActiveTab(tab);
    setFieldValue('returnDate', null);
    formik.setErrors({});
    if (tab === 2) {
      setLegs(INIT_LEGS());
      setLegErrors([]);
    }
  };

  const addLeg = () => {
    if (legs.length < 5) {
      setLegs(prev => [...prev, {from: '', to: '', date: null}]);
    }
  };

  const removeLeg = index => {
    setLegs(prev => prev.filter((_, i) => i !== index));
    setLegErrors(prev => prev.filter((_, i) => i !== index));
  };

  const updateLeg = (index, field, val) => {
    setLegs(prev =>
      prev.map((leg, i) => (i === index ? {...leg, [field]: val} : leg)),
    );
    if (legErrors[index]?.[field]) {
      setLegErrors(prev =>
        prev.map((e, i) => (i === index ? {...e, [field]: undefined} : e)),
      );
    }
  };

  const handleMultiCitySearch = () => {
    const validationErrors = legs.map(leg => {
      const e = {};
      if (!leg.from.trim()) {e.from = 'Origin is required';}
      if (!leg.to.trim()) {e.to = 'Destination is required';}
      else if (leg.to.toLowerCase() === leg.from.toLowerCase()) {e.to = 'Origin and destination must differ';}
      if (!leg.date) {e.date = 'Date is required';}
      return e;
    });
    const hasError = validationErrors.some(e => Object.keys(e).length > 0);
    setLegErrors(validationErrors);
    if (hasError) {return;}

    const extractCode = str => {
      const match = str.match(/\(([A-Z]{3})\)/);
      return match ? match[1] : str.trim().toUpperCase().slice(0, 3);
    };

    const legsWithCodes = legs.map(leg => ({
      from: leg.from,
      to: leg.to,
      fromCode: extractCode(leg.from),
      toCode: extractCode(leg.to),
      date: leg.date,
    }));

    navigation.navigate('FlightResults', {
      isMultiCity: true,
      legs: legsWithCodes,
      cabinClass,
      category: CABIN_CLASSES.find(c => c.value === cabinClass)?.label || 'Economy',
      passengers: {
        adults: values.adults,
        children: values.children,
        infantOnSeat: values.infantOnSeat,
        infantOnLap: values.infantOnLap,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}>

        {/* Trip type tabs */}
        <View style={styles.tabRow}>
          {TABS.map((tab, i) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === i && styles.tabActive]}
              onPress={() => handleTabChange(i)}
              activeOpacity={0.8}>
              <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cabin class dropdown trigger */}
        <TouchableOpacity
          style={styles.cabinDropdownField}
          onPress={() => setShowCabinModal(true)}
          activeOpacity={0.8}>
          <Text style={styles.fieldLabel}>Flight Category</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldValue}>{selectedCabin.label}</Text>
            <Text style={styles.dropArrow}>▼</Text>
          </View>
        </TouchableOpacity>

        {/* Search card — hidden for multi-city */}
        {!isMultiCity && (
          <View style={styles.card}>
            <View style={styles.routeBox}>
              <LocationSearch
                label="From"
                value={values.from}
                onSelect={val => setFieldValue('from', val)}
                onBlur={() => setFieldTouched('from', true)}
                error={errors.from}
                touched={touched.from}
              />

              <View style={styles.divider} />

              <TouchableOpacity onPress={handleSwap} style={styles.swapWrapper}>
                <SwapIcon />
              </TouchableOpacity>

              <LocationSearch
                label="To"
                value={values.to}
                onSelect={val => setFieldValue('to', val)}
                onBlur={() => setFieldTouched('to', true)}
                error={errors.to}
                touched={touched.to}
              />
            </View>

            <View style={styles.bottomRow}>
              <TouchableOpacity
                style={[
                  styles.halfField,
                  touched.departureDate && errors.departureDate && styles.fieldError,
                ]}
                onPress={() => setShowDeparturePicker(true)}
                activeOpacity={0.8}>
                <Text style={styles.fieldLabel}>Departure Date</Text>
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldValue, !values.departureDate && styles.placeholder]}>
                    {values.departureDate
                      ? moment(values.departureDate).format('DD/MM/YYYY')
                      : 'DD/MM/YYYY'}
                  </Text>
                  <CalenderIcon height={20} width={20} />
                </View>
                {touched.departureDate && errors.departureDate && (
                  <Text style={styles.errorText}>{errors.departureDate}</Text>
                )}
              </TouchableOpacity>

              {isRoundTrip ? (
                <TouchableOpacity
                  style={[
                    styles.halfField,
                    touched.returnDate && errors.returnDate && styles.fieldError,
                  ]}
                  onPress={() => setShowReturnPicker(true)}
                  activeOpacity={0.8}>
                  <Text style={styles.fieldLabel}>Return Date</Text>
                  <View style={styles.fieldRow}>
                    <Text style={[styles.fieldValue, !values.returnDate && styles.placeholder]}>
                      {values.returnDate
                        ? moment(values.returnDate).format('DD/MM/YYYY')
                        : 'DD/MM/YYYY'}
                    </Text>
                    <CalenderIcon height={20} width={20} />
                  </View>
                  {touched.returnDate && errors.returnDate && (
                    <Text style={styles.errorText}>{errors.returnDate}</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TravelersField
                  style={styles.halfField}
                  values={values}
                  onOpen={() => setShowTravelerModal(true)}
                />
              )}
            </View>

            {isRoundTrip && (
              <TravelersField
                style={styles.singleFieldBordered}
                values={values}
                onOpen={() => setShowTravelerModal(true)}
              />
            )}
          </View>
        )}

        {/* Multi-city legs */}
        {isMultiCity && (
          <>
            {legs.map((leg, index) => (
              <MultiCityLeg
                key={index}
                leg={leg}
                index={index}
                legError={legErrors[index]}
                onUpdate={(field, val) => updateLeg(index, field, val)}
                onRemove={() => removeLeg(index)}
                showRemove={legs.length > 2}
                onOpenDate={() => setLegDatePickerIndex(index)}
              />
            ))}
            {legs.length < 5 && (
              <TouchableOpacity
                style={styles.addCityBtn}
                onPress={addLeg}
                activeOpacity={0.8}>
                <Text style={styles.addCityText}>+ Add City</Text>
              </TouchableOpacity>
            )}
            <TravelersField
              style={styles.travelersFieldMC}
              values={values}
              onOpen={() => setShowTravelerModal(true)}
            />
          </>
        )}

        <TouchableOpacity
          style={styles.searchBtn}
          activeOpacity={0.85}
          onPress={() => (isMultiCity ? handleMultiCitySearch() : handleSubmit())}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </ScrollView>

      <TravelersModal
        visible={showTravelerModal}
        values={values}
        onChangePassenger={changePassenger}
        onClose={() => setShowTravelerModal(false)}
      />

      {/* Cabin class modal */}
      <Modal
        transparent
        visible={showCabinModal}
        animationType="fade"
        onRequestClose={() => setShowCabinModal(false)}
        statusBarTranslucent>
        <TouchableWithoutFeedback onPress={() => setShowCabinModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.cabinModalTitle}>Flight Category</Text>
                {CABIN_CLASSES.map((cc, i) => (
                  <TouchableOpacity
                    key={cc.value}
                    style={[
                      styles.cabinOption,
                      i < CABIN_CLASSES.length - 1 && styles.cabinOptionBorder,
                      cabinClass === cc.value && styles.cabinOptionActive,
                    ]}
                    onPress={() => {
                      setCabinClass(cc.value);
                      setShowCabinModal(false);
                    }}
                    activeOpacity={0.7}>
                    <Text style={[styles.cabinOptionText, cabinClass === cc.value && styles.cabinOptionTextActive]}>
                      {cc.label}
                    </Text>
                    {cabinClass === cc.value && (
                      <Text style={styles.cabinCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <DateTimePickerModal
        isVisible={showDeparturePicker}
        mode="date"
        minimumDate={new Date()}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        date={values.departureDate || new Date()}
        onConfirm={date => {
          setFieldValue('departureDate', date);
          setShowDeparturePicker(false);
        }}
        onCancel={() => setShowDeparturePicker(false)}
      />
      <DateTimePickerModal
        isVisible={showReturnPicker}
        mode="date"
        minimumDate={values.departureDate || new Date()}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        date={values.returnDate || new Date()}
        onConfirm={date => {
          setFieldValue('returnDate', date);
          setShowReturnPicker(false);
        }}
        onCancel={() => setShowReturnPicker(false)}
      />

      {/* Multi-city leg date picker */}
      <DateTimePickerModal
        isVisible={legDatePickerIndex !== null}
        mode="date"
        minimumDate={new Date()}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        date={
          (legDatePickerIndex !== null && legs[legDatePickerIndex]?.date) ||
          new Date()
        }
        onConfirm={date => {
          if (legDatePickerIndex !== null) {
            updateLeg(legDatePickerIndex, 'date', date);
          }
          setLegDatePickerIndex(null);
        }}
        onCancel={() => setLegDatePickerIndex(null)}
      />
    </SafeAreaView>
  );
};

export default FlightHome;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Constants.white},
  scroll: {paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120},
  tabRow: {flexDirection: 'row', marginBottom: 20, gap: 8},
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
    backgroundColor: Constants.white,
  },
  tabActive: {backgroundColor: Constants.dark_green, borderColor: Constants.dark_green},
  tabText: {fontSize: 13, fontFamily: FONTS.Medium, color: Constants.black},
  tabTextActive: {color: Constants.white},
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
    backgroundColor: Constants.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  routeBox: {padding: 16, position: 'relative', zIndex: 100},
  locationWrapper: {paddingVertical: 4, zIndex: 1},
  locationWrapperFocused: {paddingVertical: 4, zIndex: 200},
  input: {
    fontSize: 15,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    paddingVertical: 6,
    paddingRight: 44,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  inputError: {borderBottomColor: Constants.red},
  divider: {height: 1, backgroundColor: Constants.customgrey5, marginVertical: 8},
  swapWrapper: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{translateY: -18}],
    zIndex: 300,
  },
  swapBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
    backgroundColor: Constants.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  swapArrow: {fontSize: 16, color: Constants.dark_green, fontWeight: '600'},
  fieldLabel: {
    fontSize: 12,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey3,
    marginBottom: 2,
  },
  fieldValue: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.black, flex: 1},
  placeholder: {color: Constants.customgrey3, fontFamily: FONTS.Regular, fontSize: 13},
  fieldRow: {flexDirection: 'row', alignItems: 'center'},
  errorText: {fontSize: 11, fontFamily: FONTS.Regular, color: Constants.red, marginTop: 3},
  bottomRow: {flexDirection: 'row', borderTopWidth: 1, borderTopColor: Constants.customgrey5},
  halfField: {
    flex: 1,
    padding: 14,
    borderRightWidth: 1,
    borderRightColor: Constants.customgrey5,
  },
  fieldError: {backgroundColor: '#fff5f5'},
  singleField: {padding: 14},
  singleFieldBordered: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: Constants.customgrey5,
  },
  dropArrow: {fontSize: 10, color: Constants.customgrey3, marginLeft: 4},

  /* Autocomplete dropdown */
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Constants.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
    overflow: 'hidden',
  },
  dropLoader: {padding: 14},
  dropItem: {paddingHorizontal: 14, paddingVertical: 11},
  dropDivider: {borderTopWidth: 1, borderTopColor: Constants.customgrey5},
  dropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  dropCity: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.black},
  dropCode: {fontSize: 13, fontFamily: FONTS.Bold, color: Constants.dark_green},
  dropAirport: {fontSize: 12, fontFamily: FONTS.Regular, color: Constants.customgrey3},

  /* Travelers modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Constants.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Constants.customgrey5,
  },
  passengerLabel: {flex: 1, fontSize: 14, fontFamily: FONTS.Medium, color: Constants.black},
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Constants.light_green,
    borderRadius: 20,
    overflow: 'hidden',
  },
  pillBtn: {paddingHorizontal: 14, paddingVertical: 8},
  pillBtnDisabled: {opacity: 0.35},
  pillBtnText: {
    fontSize: 17,
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
    lineHeight: 20,
  },
  pillBtnTextDisabled: {color: Constants.customgrey3},
  pillCount: {
    fontSize: 15,
    fontFamily: FONTS.SemiBold,
    color: Constants.dark_green,
    minWidth: 22,
    textAlign: 'center',
  },
  doneBtn: {
    margin: 16,
    backgroundColor: Constants.dark_green,
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: 'center',
  },
  doneBtnText: {color: Constants.white, fontSize: 15, fontFamily: FONTS.SemiBold},
  /* Multi-city */
  legCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
    backgroundColor: Constants.white,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  legHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: Constants.customgrey5,
  },
  legLabel: {fontSize: 13, fontFamily: FONTS.SemiBold, color: Constants.dark_green},
  removeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {fontSize: 12, color: '#ef4444', fontFamily: FONTS.Bold},
  legRoute: {padding: 16, position: 'relative', zIndex: 100},
  legDateField: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: Constants.customgrey5,
  },
  addCityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Constants.dark_green,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  addCityText: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.dark_green},
  travelersFieldMC: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
    backgroundColor: Constants.white,
    marginBottom: 12,
  },
  /* Cabin class dropdown */
  cabinDropdownField: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
    backgroundColor: Constants.white,
    marginBottom: 16,
  },
  cabinModalTitle: {
    fontSize: 15,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Constants.customgrey5,
  },
  cabinOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cabinOptionBorder: {borderBottomWidth: 1, borderBottomColor: Constants.customgrey5},
  cabinOptionActive: {backgroundColor: '#f0f7f0'},
  cabinOptionText: {fontSize: 14, fontFamily: FONTS.Regular, color: Constants.black},
  cabinOptionTextActive: {fontFamily: FONTS.SemiBold, color: Constants.dark_green},
  cabinCheckmark: {fontSize: 15, color: Constants.dark_green, fontFamily: FONTS.Bold},

  searchBtn: {
    marginTop: 24,
    backgroundColor: Constants.dark_green,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  searchBtnText: {color: Constants.white, fontSize: 16, fontFamily: FONTS.SemiBold},
});
