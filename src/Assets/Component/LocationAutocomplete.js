import {
  Dimensions,
  Image,
  InteractionManager,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Constants, { FONTS, Googlekey } from '../../Assets/Helpers/constant';
import { BackIcon, CrossIcon, MappinIcon, RightArrow, SearchIcon } from '../../../Theme';
import axios from 'axios';
import { navigate } from '../../../navigationRef';
import { fromAddress, setKey } from 'react-geocode';
import ActionSheet from 'react-native-actions-sheet';
import { debounce } from 'lodash'
import { Post } from '../Helpers/Service';

const LocationAutocomplete = props => {
  const inputRef = useRef(null);
  // console.log(props)
  const [showList, setShowList] = useState(false);
  const [prediction, setPredictions] = useState([]);
  const [searchaddress, setsearchAddress] = useState('');
  const [location, setLocation] = useState({});


  useEffect(() => {
    setsearchAddress(props.value);
  }, [props.value]);

  useEffect(() => {
    if (props.visible) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
    }
  }, [props.visible]);

  const getLocation = async () => {
    try {
      if (Platform.OS === 'ios') {
        request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(async result => {
          console.log(result);
        });
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        console.log(PermissionsAndroid.RESULTS.GRANTED, granted);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the location');
        } else {
          console.log('location permission denied');
          // alert("Location permission denied");
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const GOOGLE_PACES_API_BASE_URL =
    'https://maps.googleapis.com/maps/api/place';

  const GooglePlacesInput = async text => {
    if (!text) {
      setPredictions([]);
      return;
    }
    const apiUrl = `${GOOGLE_PACES_API_BASE_URL}/autocomplete/json?key=${Googlekey}&input=${text}`;
    //&components=country:ec
    try {
      const result = await axios.request({
        method: 'post',
        url: apiUrl,
      });
      if (result) {
        const {
          data: { predictions },
        } = result;
        console.log(result);
        setPredictions(predictions);
        setShowList(true);
      }
    } catch (e) {
      console.log(e);
    }
    // Post('searchaddress', {key:Googlekey,input:text}).then(
    //   async res => {
    //     console.log(res);
    //    setPredictions(res?.data);
    //     setShowList(true);
    //   },
    //   err => {
    //     console.log(err);
    //   },
    // );
  };

  const checkLocation = async add => {
    console.log('add===>', add);
    try {
      setKey(Googlekey);
      if (add) {
        fromAddress(add).then(
          response => {
            console.log('response==>', response);
            const lat = response.results[0].geometry.location;
            //   setLocation(lat);
            props.getLocationValue(lat, add);
            props.onClose();
            setsearchAddress('')
          },
          error => {
            console.error(error);
          },
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  const debouncelocationdata = useMemo(() => debounce(GooglePlacesInput, 200), [])
  const handlsearch = useCallback((text) => {
    setsearchAddress(text)
    debouncelocationdata(text)
  }, [debouncelocationdata])
  return (
    <Modal
      style={styles.container}
      transparent={true}
      animationType={'slide'}
      visible={props.visible}
      onRequestClose={() => { }}>
      <View
        style={{
          backgroundColor: Constants.white,
          flex: 1,
          paddingTop:Platform.OS==='ios'? 50:0,
          // height: Dimensions.get('window').height,
          // width: Dimensions.get('window').width,
          padding: 20,
        }}>
        <BackIcon
          height={30}
          width={30}
          color={Constants.black}
          style={styles.aliself}
          onPress={() => props.onClose()}
        />
        {/* <CrossIcon
          color={Constants.black}
          height={15}
          width={15}
          onPress={() => props.onClose()}
        /> */}
        {/* <Text style={styles.headtxt}>To ?</Text> */}
        <View style={styles.inpucov}>
          <View style={styles.round}>
            <SearchIcon height={20} width={20} color={Constants.black}/>
          </View>
          <TextInput
            ref={inputRef}
            style={styles.inputfield}
            placeholder={props?.placeholder || "Search Address"}
            placeholderTextColor={Constants.black}
            value={searchaddress}
            onChangeText={e => {
              // setsearchAddress(e), GooglePlacesInput(e);
              handlsearch(e)
            }}></TextInput>
          {/* {prediction && prediction.length > 0 && ( */}
          <CrossIcon
            color={Constants.customgrey2}
            height={15}
            width={15}
            style={{ alignSelf: 'center', marginRight: 5 }}
            onPress={() => {
              // setsearchAddress(''), GooglePlacesInput('');
              handlsearch('')
            }}
          />
          {/* )} */}
        </View>
        {/* <View style={styles.horline}></View> */}
        <View style={{ flex: 1, marginTop: 10, paddingHorizontal: 10 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always">
            {prediction &&
              prediction.length > 0 &&
              prediction.map((item, index) => (
                <TouchableOpacity
                  style={[styles.listcov2]}
                  key={index}
                  onPress={() => {
                    checkLocation(item.description),
                      setsearchAddress(item.description),
                      GooglePlacesInput('');
                  }}>
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 15, }}>
                    <MappinIcon height={35} width={35} />
                    <View>
                      <Text style={styles.suggesttxt1}>
                        {item?.structured_formatting?.main_text}
                      </Text>
                      <Text style={styles.suggesttxt2}>
                        {item?.structured_formatting?.secondary_text}
                      </Text>
                    </View>
                  </View>
                  <RightArrow
                    color={Constants.customgrey2}
                    style={{ alignSelf: 'center' }}
                  />
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default LocationAutocomplete;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.white,
    flex: 1,
    // height: Dimensions.get('window').height,
    // width: Dimensions.get('window').width,
    padding: 20,
    zIndex: 1100,
  },
  headtxt: {
    color: Constants.black,
    fontFamily: FONTS.Bold,
    fontSize: 28,
    marginVertical: 20,
  },
  inputfield: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    flex: 1,
    // backgroundColor:'red'
  },
  inpucov: {
    backgroundColor: Constants.customgrey4,
    marginVertical: 15,
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  searicon: {
    alignSelf: 'center',
    marginHorizontal: 10,
  },
  listcov: {
    flexDirection: 'row',
    marginVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 15,
  },
  txt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Regular,
    flex: 1,
    marginHorizontal: 10,
  },
  horline: {
    height: 3,
    backgroundColor: Constants.customgrey,
    width: '120%',
    marginLeft: -20,
  },
  suggesttxt1: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: Constants.font700,
    lineHeight: 20
    // marginVertical: 5,
  },
  suggesttxt2: {
    color: Constants.customgrey2,
    fontSize: 14,
    fontFamily: Constants.font500,
    marginTop: 2
  },
  listcov2: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderColor: "#BFBFBF",
    // paddingBottom: 5,
  },
  round: {
    height: 30,
    width: 30,
    backgroundColor: Constants.white,
    borderRadius: 30,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
