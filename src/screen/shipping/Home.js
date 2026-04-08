import React, { useContext, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { Svg, Path, Rect, Circle } from 'react-native-svg';
import { CalenderIcon } from '../../../Theme';
import { navigate } from '../../../navigationRef';
import { Dropdown } from 'react-native-element-dropdown';
import Constants, { FONTS } from '../../Assets/Helpers/constant';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { ShippingDataContext } from '../../../App';
import { useTranslation } from 'react-i18next';


const CheckIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path
      d="M3 8L6.5 11.5L13 4.5"
      stroke="#2d5f4f"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DeliveryOptionsPage = () => {
  const { t } = useTranslation();
  const [deliveryType, setDeliveryType] = useState('ground');
  const [insurance, setInsurance] = useState(true);
  const [showCourierLogo, setShowCourierLogo] = useState(false);
  const [applyShippingRules, setApplyShippingRules] = useState(false);
  const [shippingdata, setshippingdata] = useContext(ShippingDataContext);
  const [scheduleDate, setScheduleDate] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dropdownRef = useRef();
  const dropdownRef2 = useRef();
  const dropdownRef3 = useRef();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formdata, setformdata] = useState({
      weightunit: '',
      dimensionunit: '',
      incoterm: '',
    });

    const handleConfirm = date => {
    setSelectedDate(date);
    setDatePickerVisibility(false);
  };

  const RadioButton = ({ selected }) => (
    <View style={[styles.radioBtn, selected && styles.radioBtnSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
  );

  const ToggleSwitch = ({ active, onToggle }) => (
    <TouchableOpacity
      style={[styles.toggleSwitch, active && styles.toggleSwitchActive]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={[styles.slider, active && styles.sliderActive]} />
    </TouchableOpacity>
  );

  // Weight Units Array
 const weightUnits = [
  {
    label: 'Kilograms (kg)',
    value: 'kg'
  },
  {
    label: 'Grams (g)',
    value: 'g'
  },
  {
    label: 'Pounds (lb)',
    value: 'lb'
  },
  {
    label: 'Ounces (oz)',
    value: 'oz'
  },
  {
    label: 'Metric Tons (t)',
    value: 't'
  },
  {
    label: 'Short Tons (US)',
    value: 'ton_us'
  },
  {
    label: 'Long Tons (UK)',
    value: 'ton_uk'
  },
  {
    label: 'Milligrams (mg)',
    value: 'mg'
  }
];

// Dimension Units Array
const dimensionUnits = [
  {
    label: 'Centimeters (cm)',
    value: 'cm'
  },
  {
    label: 'Meters (m)',
    value: 'm'
  },
  {
    label: 'Inches (in)',
    value: 'in'
  },
  {
    label: 'Feet (ft)',
    value: 'ft'
  },
  {
    label: 'Millimeters (mm)',
    value: 'mm'
  },
  {
    label: 'Yards (yd)',
    value: 'yd'
  },
  {
    label: 'Kilometers (km)',
    value: 'km'
  },
  {
    label: 'Miles (mi)',
    value: 'mi'
  }
];

// Incoterms Array (bonus - for the Incoterms dropdown)
const incoterms = [
  {
    label: 'EXW - Ex Works',
    value: 'exw'
  },
  {
    label: 'FCA - Free Carrier',
    value: 'fca'
  },
  {
    label: 'CPT - Carriage Paid To',
    value: 'cpt'
  },
  {
    label: 'CIP - Carriage and Insurance Paid To',
    value: 'cip'
  },
  {
    label: 'DAP - Delivered At Place',
    value: 'dap'
  },
  {
    label: 'DPU - Delivered at Place Unloaded',
    value: 'dpu'
  },
  {
    label: 'DDP - Delivered Duty Paid',
    value: 'ddp'
  },
  {
    label: 'FAS - Free Alongside Ship',
    value: 'fas'
  },
  {
    label: 'FOB - Free On Board',
    value: 'fob'
  },
  {
    label: 'CFR - Cost and Freight',
    value: 'cfr'
  },
  {
    label: 'CIF - Cost, Insurance and Freight',
    value: 'cif'
  }
];
const submit=()=>{
  if(!formdata.weightunit||!formdata.dimensionunit||!formdata.incoterm){
    setSubmitted(true)
    return;
  }
  setshippingdata({
    ...formdata,
    insurance:insurance,
    showCourierLogo:showCourierLogo,
    applyShippingRules:applyShippingRules,
    scheduleDate:scheduleDate,
    selectedDate:selectedDate,
  })
  navigate('Parcel')
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
      {/* Header Image */}
      <View style={styles.headerImage}>
        <Image
          source={require('../../Assets/Images/shippinghome.png')}
          style={styles.deliveryImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        {/* <Text style={styles.title}>Choose your Delivery</Text>

        <View style={styles.deliveryOptions}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => setDeliveryType('ground')}
            activeOpacity={0.7}
          >
            <RadioButton selected={deliveryType === 'ground'} />
            <Text style={styles.optionLabel}>Ground Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setDeliveryType('air')}
            activeOpacity={0.7}
          >
            <RadioButton selected={deliveryType === 'air'} />
            <Text style={styles.optionLabel}>Air Delivery</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>From</Text>
          <TextInput
            style={styles.inputField}
            value="Los Angeles (LAX)"
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>To</Text>
          <TextInput
            style={styles.inputField}
            value="Los Angeles (LAX)"
            editable={false}
          />
        </View> */}

        {/* Shipping Preferences */}
        <Text style={styles.title}>Shipping Preferences</Text>

        {/* Incoterms */}
       <Dropdown
            ref={dropdownRef3}
            data={incoterms}
            labelField="label"
            valueField="value"
            placeholder={"Incoterms"}
            value={formdata?.incoterm}
            onChange={item => {}}
            renderItem={item => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  setformdata({
                    ...formdata,
                    incoterm: item?.value,
                    incotermName: item?.label,
                  });
                  dropdownRef3.current?.close();
                }}>
                <Text style={styles.itemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
            style={styles.dropdown}
            placeholderStyle={styles.placeholder}
            selectedTextStyle={styles.selectedText}
          />

        {submitted && formdata?.incoterm === '' && (
          <Text style={styles.require}>{t("Incoterms is required")}</Text>
        )}
        {/* Insurance */}
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Insurance:</Text>
          <ToggleSwitch active={insurance} onToggle={() => setInsurance(!insurance)} />
        </View>

        {/* Show Courier Logo URL */}
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Show Courier Logo URL:</Text>
          <ToggleSwitch
            active={showCourierLogo}
            onToggle={() => setShowCourierLogo(!showCourierLogo)}
          />
        </View>

        {/* Apply Shipping Rules */}
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Apply Shipping Rules:</Text>
          <ToggleSwitch
            active={applyShippingRules}
            onToggle={() => setApplyShippingRules(!applyShippingRules)}
          />
        </View>

        {/* Weight Unit */}
        <Dropdown
            ref={dropdownRef}
            data={weightUnits}
            labelField="label"
            valueField="value"
            placeholder={"Weight Unit:"}
            value={formdata?.weightunit}
            onChange={item => {}}
            renderItem={item => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  setformdata({
                    ...formdata,
                    weightunit: item?.value,
                    weightunitName: item?.label,
                  });
                  dropdownRef.current?.close();
                }}>
                <Text style={styles.itemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
            style={styles.dropdown}
            placeholderStyle={styles.placeholder}
            selectedTextStyle={styles.selectedText}
          />
{submitted && formdata?.weightunit === '' && (
          <Text style={styles.require}>{t("Weight Unit is required")}</Text>
        )}
        {/* Dimension Unit */}
        <Dropdown
            ref={dropdownRef2}
            data={dimensionUnits}
            labelField="label"
            valueField="value"
            placeholder={"Dimension Unit:"}
            value={formdata?.dimensionunit}
            renderItem={item => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  setformdata({
                    ...formdata,
                    dimensionunit: item?.value,
                    dimensionunitName: item?.label,
                  });
                  dropdownRef2.current?.close();
                }}>
                <Text style={styles.itemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
            style={styles.dropdown}
            placeholderStyle={styles.placeholder}
            selectedTextStyle={styles.selectedText}
          />
        {submitted && formdata?.dimensionunit === '' && (
          <Text style={styles.require}>{t("Dimension Unit is required")}</Text>
        )}
        {/* Schedule Date Checkbox */}
        <TouchableOpacity
          style={styles.checkboxGroup}
          onPress={() => setScheduleDate(!scheduleDate)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, scheduleDate && styles.checkboxActive]}>
            {scheduleDate && <CheckIcon />}
          </View>
          <Text style={styles.checkboxLabel}>Schedule Date</Text>
        </TouchableOpacity>

        {/* Date Input */}
       {scheduleDate&& <TouchableOpacity style={styles.dateInputContainer} onPress={() => setDatePickerVisibility(true)} activeOpacity={0.8}>
          <Text style={styles.inputField}>{moment(selectedDate).format('DD-MM-YYYY')}</Text>
          <View style={styles.calendarIconContainer}>
            <CalenderIcon height={20} width={20} />
          </View>
        </TouchableOpacity>}

        {/* Next Button */}
        <TouchableOpacity style={styles.nextBtn} activeOpacity={0.8} onPress={()=>submit()}>
          <Text style={styles.nextBtnText}>Next</Text>
        </TouchableOpacity>
        <View style={{marginBottom:90}}></View>
      </View>
      <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              date={selectedDate}
              onConfirm={handleConfirm}
              onCancel={() => setDatePickerVisibility(false)}
            />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#d4c5b0',
  },
  deliveryImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 24,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  title: {
    fontSize: 16,
    marginBottom: 20,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  deliveryOptions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioBtnSelected: {
    borderColor: '#2d5f4f',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2d5f4f',
  },
  optionLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  inputGroup: {
    marginBottom: 16,
    backgroundColor:Constants.white,
    boxShadow:'0.5px 1px 3px 0.05px grey',
    padding:10,
    borderRadius:20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputField: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 24,
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  preferenceLabel: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Medium,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    backgroundColor: '#e0e0e0',
    borderRadius: 14,
    justifyContent: 'center',
    padding: 3,
  },
  toggleSwitchActive: {
    backgroundColor: '#2d5f4f',
  },
  slider: {
    width: 22,
    height: 22,
    backgroundColor: 'white',
    borderRadius: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  sliderActive: {
    transform: [{ translateX: 22 }],
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: '#2d5f4f',
    backgroundColor: '#e8f5f0',
  },
  checkboxLabel: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Medium,
  },
  dateInputContainer: {
    position: 'relative',
  },
  calendarIconContainer: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  nextBtn: {
    width: '100%',
    padding: 16,
    backgroundColor: '#2d5f4f',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  nextBtnText: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },

  dropdown: {
    borderRadius: 10,
    // backgroundColor:'red',
    height: 55,
    padding: 10,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
    marginBottom:10
  },
  placeholder: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    // paddingVertical: 12,
  },
  selectedText: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    // paddingVertical: 12,
  },
  itemContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    // width: '100%',
    backgroundColor: Constants.normal_green,
    borderBottomWidth: 1,
    borderColor: Constants.white,
  },
  itemText: {
    fontSize: 14,
    color: Constants.white,
    fontFamily: FONTS.Medium,
  },
  signInbtn: {
    height: 55,
    // width: 370,
    borderRadius: 10,
    backgroundColor: Constants.normal_green,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 70,
  },
  buttontxt: {
    color: Constants.white,
    fontSize: 18,
    fontFamily: FONTS.Bold,
  },
    selcatcov:{
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent:'space-between',
    borderRadius: 10,
    // backgroundColor:'red',
    height: 55,
    lineHeight: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
  },
  selcattxt:{
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
  },
  require:{
    color:Constants.red,
    fontFamily:FONTS.Medium,
    marginLeft:10,
    fontSize:14,
    marginBottom:10
  },
});

export default DeliveryOptionsPage;