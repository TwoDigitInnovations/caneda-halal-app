import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Constants, { FONTS, PROD_TOKEN } from '../../Assets/Helpers/constant';
import { BackIcon } from '../../../Theme';
import * as RNLocalize from 'react-native-localize';
import { Dropdown } from 'react-native-element-dropdown';
import { ShippingDataContext } from '../../../App';

const Parcel = () => {
  // const [batteryPI968, setBatteryPI968] = useState(false);
  // const [batteryPI967, setBatteryPI967] = useState(false);
  // const [containsLiquid, setContainsLiquid] = useState(false);
  // const [height, setHeight] = useState('');
  // const [weight, setWeight] = useState('');
  // const [length, setLength] = useState('');
  // const [quantity, setQuantity] = useState('');
  // const [customValue, setCustomValue] = useState('');
  // const [originCountry, setOriginCountry] = useState('');
  // const [selctedCategory, setSelctedCategory] = useState('');
  // const [hs_code, setHs_code] = useState('');
  const [selctedCurrency, setSelctedCurrency] = useState('');
  const [allCountry, setAllCountry] = useState([]);
  const [allCategory, setAllCategory] = useState([]);
  const [shippingdata, setshippingdata] = useContext(ShippingDataContext);

  const emptyItem = {
  batteryPI968: false,
  batteryPI967: false,
  containsLiquid: false,
  height: '',
  weight: '',
  length: '',
  quantity: '',
  customValue: '',
  originCountry: '',
  categoryId: '',
  hs_code: '',
};
const [items, setItems] = useState([emptyItem]);

const updateItem = (index, key, value) => {
  const updated = [...items];
  updated[index][key] = value;
  setItems(updated);
};

const addItem = () => {
  setItems(prev => [...prev, emptyItem]);
};


  const dropdownRef = useRef();
  const dropdownRef2 = useRef();

  const CheckBox = ({ checked, onPress, label }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

const hasFetched = useRef(false);

useEffect(() => {
  if (hasFetched.current) return;
  hasFetched.current = true;
  getAllCountry();
}, []);
useEffect(() => {
  getUserCurrency();
}, []);


const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url, options, retries = 3) {
  const res = await fetch(url, options);

  if (res.status === 429 && retries > 0) {
    await sleep(1000); // wait 1 second
    return fetchWithRetry(url, options, retries - 1);
  }

  return res;
}

const getAllCountry = async () => {
  let allCountries = [];
  let page = 1;
  const per_page = 100;
  let hasMore = true;

  try {
    while (hasMore) {
      const res = await fetchWithRetry(
        `https://public-api-sandbox.easyship.com/2024-09/countries?page=${page}&per_page=${per_page}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${PROD_TOKEN}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await res.json();

      if (!data?.countries?.length) {
        hasMore = false;
        break;
      }

      allCountries.push(...data.countries);
      hasMore = data.countries.length === per_page;
      page++;

      await sleep(200); // rate-limit friendly
    }
    setTimeout(() => {
      getAllCategory();
    }, 300);
    setAllCountry(allCountries);
  } catch (error) {
    console.error('Easyship country fetch failed:', error);
  }
};
const getAllCategory = async () => {
  let page = 1;
  const per_page = 100;
  try {
      const res = await fetch(
        `https://public-api-sandbox.easyship.com/2024-09/item_categories?page=${page}&per_page=${per_page}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${PROD_TOKEN}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await res.json();
console.log('All Categories:', data);
    setAllCategory(data?.item_categories);
  } catch (error) {
    console.error('Easyship country fetch failed:', error);
  }
};

console.log('All Countries:', allCountry);
const getUserCurrency = () => {
  const currencies = RNLocalize.getCurrencies();
  // return currencies?.[0] || 'USD';
  setSelctedCurrency(currencies?.[0] || 'USD');
  console.log('Currencies:', currencies);
};

const submit=()=>{
  if(!formdata.weightunit||!formdata.dimensionunit||!formdata.incoterm){
    setSubmitted(true)
    return;
  }
  setshippingdata({
    ...formdata,
    items})
  navigate('Parcel')
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D5F4F" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackIcon height={24} width={24} color={Constants.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parcel Information</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Special Item Handling */}
        {items.map((item, index) => (
        <View style={{paddingBottom:20,borderBottomWidth:2,borderColor:Constants.dark_green}} key={index}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Item Handling</Text>
          
          <View style={styles.checkboxRow}>
            <CheckBox
              checked={item?.batteryPI968}
              onPress={() => updateItem(index, 'batteryPI968', !item.batteryPI968)}
              label="Contains Battery (PI968)"
            />
            <CheckBox
              checked={item?.batteryPI967}
              onPress={() => updateItem(index, 'batteryPI967', !item.batteryPI967)}
              label="Contains Battery (PI967)"
            />
          </View>

          <CheckBox
            checked={item?.containsLiquid}
            onPress={() => updateItem(index, 'containsLiquid', !item.containsLiquid)}
            label="Contains Liquid"
          />
        </View>

        <Dropdown
            ref={dropdownRef}
            data={allCountry}
            labelField="name"
            valueField="alpha2"
            placeholder={"Origin Country"}
            value={item?.originCountry}
            inputSearchStyle={styles.inputSearchStyle}
            searchField="name"
            search
            searchPlaceholder="Search..."
            renderItem={c => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  updateItem(index, 'originCountry', c.alpha2)
                  dropdownRef.current?.close();
                }}>
                <Text style={styles.itemText}>{c.name}</Text>
              </TouchableOpacity>
            )}
            style={styles.dropdown}
            placeholderStyle={styles.placeholder}
            selectedTextStyle={styles.selectedText}
          />

        {/* Dimensions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dimensions</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Height</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Height"
                placeholderTextColor="#C7C7CD"
                value={item?.height}
                onChangeText={v => updateItem(index, 'height', v)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Weight</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Weight"
                placeholderTextColor="#C7C7CD"
                value={item?.weight}
                onChangeText={v => updateItem(index, 'weight', v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Length</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Length"
                placeholderTextColor="#C7C7CD"
                value={item?.length}
                onChangeText={v => updateItem(index, 'length', v)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Quantity"
                placeholderTextColor="#C7C7CD"
                value={item?.quantity}
                onChangeText={v => updateItem(index, 'quantity', v)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Declared Currency Dropdown */}
        {/* <Dropdown label="Declared Currency" /> */}

       {allCategory?.length>0&& <Dropdown
            ref={dropdownRef2}
            data={allCategory}
            labelField="name"
            valueField="id"
            placeholder={"Select Category"}
            value={item?.categoryId}
            inputSearchStyle={styles.inputSearchStyle}
            searchField="name"
            search
            searchPlaceholder="Search..."
            renderItem={cat => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  updateItem(index, 'categoryId', cat.id);
                  updateItem(index, 'hs_code', cat.hs_code);
                  dropdownRef2.current?.close();
                }}>
                <Text style={styles.itemText}>{cat.name}</Text>
              </TouchableOpacity>
            )}
            style={styles.dropdown}
            placeholderStyle={styles.placeholder}
            selectedTextStyle={styles.selectedText}
          />}

        {/* Declared Custom Value */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Declared Custom Value ({selctedCurrency})</Text>
          <TextInput
            style={styles.fullWidthInput}
            placeholder="Enter Amount"
            placeholderTextColor="#C7C7CD"
            value={item?.customValue}
            onChangeText={v => updateItem(index, 'customValue', v)}
            keyboardType="numeric"
          />
        </View>
</View>))}
        {/* Add More Items Button */}
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add more items</Text>
        </TouchableOpacity>

        {/* CTA Button */}
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>CTA</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Parcel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  header: {
    backgroundColor: '#2D5F4F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    color: Constants.white,
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D1D6',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2D5F4F',
    borderColor: '#2D5F4F',
  },
  checkmark: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  checkboxLabel: {
    fontSize: 12,
    color: Constants.black,
    fontFamily:FONTS.Medium,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginRight: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Constants.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    color: '#000000',
  },
  fullWidthInput: {
    backgroundColor: Constants.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginTop: 8,
    color: '#000000',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  addButtonIcon: {
    fontSize: 20,
    color: Constants.black,
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Medium,
  },
  ctaButton: {
    backgroundColor: '#2D5F4F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  ctaButtonText: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  bottomSpacer: {
    height: 30,
  },

  dropdown: {
    borderRadius: 10,
    // backgroundColor:'red',
    height: 55,
    padding: 10,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
    marginTop:20
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
  inputSearchStyle: {
        color: Constants.black,
        height: 40,
        fontSize: 14,
        fontFamily: FONTS.Medium
    },
});