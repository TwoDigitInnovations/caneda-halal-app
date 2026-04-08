import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import Constants, {FONTS, Googlekey} from '../../../Assets/Helpers/constant';
import {goBack, navigate} from '../../../../navigationRef';
import {LoadContext} from '../../../../App';
import LocationAutocomplete from '../../../Assets/Component/LocationAutocomplete';
import {
  DrawerActions,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {BackIcon, CrossIcon, PlusIcon} from '../../../../Theme';

const StopPage = props => {
  const {t} = useTranslation();
  const data = props?.route?.params;
  const [locationshow, setlocationshow] = useState(false);
  const [destinationshow, setdestinationshow] = useState(false);
  const [activeStopIndex, setActiveStopIndex] = useState(null);
  const [showstop, setShowstop] = useState(false);
  const [addstop, setaddstop] = useState(false);
  const [loading, setLoading] = useContext(LoadContext);
  const [locationadd, setlocationadd] = useState('');
  const [location, setlocation] = useState(null);
  const [destinationadd, setdestinationadd] = useState('');
  const [destination, setdestination] = useState(null);
  const [showsrcadd, setshowsrcadd] = useState(false);
  const [stops, setStops] = useState([]);

  const isFocused = useIsFocused();

  useEffect(() => {
    setlocationadd(data?.locationadd);
    setlocation(data?.location);
    setdestinationadd(data?.destinationadd);
    setdestination(data?.destination);
    setStops(data?.stops ? data?.stops : []);
  }, [data]);

  const getLocationValue = (lat, add, set) => {
    console.log('lat=======>', lat);
    console.log('add=======>', add);
    if (set === 'start') {
      setlocationadd(add);
      // setlocation([lat.lng, lat.lat]);
      // setlocation({
      //   latitude: lat.lat,
      //   longitude: lat.lng,
      // });
      setlocation({
        latitude: lat.lat,
        longitude: lat.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setshowsrcadd(true);
    }
    if (set === 'end') {
      setdestinationadd(add);
      setdestination({
        latitude: lat.lat,
        longitude: lat.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };
  const getLocationValue2 = (lat, add) => {
    const obj = {
      address: add,
      location: {
        latitude: lat.lat,
        longitude: lat.lng,
      },
    };
    setStops(perv => [...perv, obj]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topcov}>
        <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </View>
      <Text style={styles.edittxt}>{t('Add Route')}</Text>
      <View style={styles.stopcov}>
        <View style={{alignItems: 'center', paddingBottom: 10}}>
          <View style={[styles.round]}></View>
          <View style={styles.verticleline}></View>
          {showstop&&<View style={[styles.box]}>
            <Text style={styles.stoptxt}> 1</Text>
          </View>}
          {showstop&&<View style={styles.verticleline}></View>}
          {stops?.length > 0 &&
            stops.map((item, index) => (
              <View key={index} style={{alignItems: 'center'}}>
                <View style={[styles.box]}>
                  <Text style={styles.stoptxt}>{index + 2}</Text>
                </View>
                <View style={styles.verticleline}></View>
              </View>
            ))}
          <View style={[styles.round]}></View>
        </View>
        <View style={{justifyContent: 'space-between', flex: 1}}>
          <TouchableOpacity
            style={styles.addcov}
            onPress={() => setlocationshow(true)}>
            <Text
              style={[
                styles.row1txt,
                {color: locationadd ? Constants.black : Constants.customgrey3,
                  width: showstop?'95%':'84%',
                },
              ]}
              numberOfLines={1}>
              {locationadd ? locationadd : t('Select start location')}
            </Text>
          </TouchableOpacity>
          {stops?.length > 0 &&
            stops.map((item, index) => (
              <View key={index}>
                <TouchableOpacity
                  style={[styles.addcov2]}
                  onPress={() => setActiveStopIndex(index)}>
                  <Text style={[styles.row2txt]} numberOfLines={1}>
                    {item?.address ? item?.address : t('Add Stop')}
                  </Text>
                  <CrossIcon
                    onPress={() => {
                      const updatedStops = [...stops];
                      updatedStops.splice(index, 1), setStops(updatedStops);
                    }}
                  />
                </TouchableOpacity>
                <LocationAutocomplete
                  value={item?.address}
                  visible={activeStopIndex === index}
                  setVisible={() => setActiveStopIndex(null)}
                  onClose={() => setActiveStopIndex(null)}
                  placeholder={t('Stop Location')}
                  backgroundColor={Constants.black}
                  getLocationValue={(lat, add) => {
                    const updatedStops = [...stops];
                    updatedStops[index] = {
                      ...updatedStops[index],
                      address: add,
                      location: {
                        latitude: lat.lat,
                        longitude: lat.lng,
                      },
                    };
                    setStops(updatedStops);
                  }}
                />
              </View>
            ))}
          {showstop&&<TouchableOpacity
            style={[styles.addcov2]}
            onPress={() => setaddstop(true)}>
            <Text style={[styles.row2txt]} numberOfLines={1}>
              {t("Add Stop")}
            </Text>
          </TouchableOpacity>}
          <LocationAutocomplete
            value=""
            visible={addstop}
            setVisible={setaddstop}
            onClose={() => {
              setaddstop(!addstop);
            }}
            placeholder={t('Stop Location')}
            backgroundColor={Constants.black}
            getLocationValue={(lat, add) => getLocationValue2(lat, add)}
          />
          <TouchableOpacity
            style={[styles.addcov2, {borderBottomWidth: 0}]}
            onPress={() => setdestinationshow(true)}>
            <Text
              style={[
                styles.row1txt,
                {
                  color: destinationadd
                    ? Constants.black
                    : Constants.customgrey3,
                    width: '85%',
                },
              ]}
              numberOfLines={1}>
              {destinationadd ? destinationadd : t('Select destination')}
            </Text>
          </TouchableOpacity>
         {!showstop&& <TouchableOpacity style={styles.actionButton} onPress={()=>setShowstop(true)}>
            <PlusIcon height={15} width={15} color={Constants.white}/>
          </TouchableOpacity>}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button2,
          {
            backgroundColor:
              locationadd && destinationadd ? Constants.dark_green : '#7a9186',
          },
        ]}
        onPress={() =>
          navigate('SideMenu', {
            screen: 'Home',
            params: {location, locationadd, destination, destinationadd, stops},
          })
        }>
        <Text style={styles.buttontxt}>{t('Confirm')}</Text>
      </TouchableOpacity>

      <LocationAutocomplete
        value={locationadd}
        visible={locationshow}
        setVisible={setlocationshow}
        onClose={() => {
          setlocationshow(!locationshow);
        }}
        placeholder={t('Pick up Location')}
        backgroundColor={Constants.black}
        getLocationValue={(lat, add) => getLocationValue(lat, add, 'start')}
      />
      <LocationAutocomplete
        value={destinationadd}
        visible={destinationshow}
        setVisible={setdestinationshow}
        onClose={() => {
          setdestinationshow(!destinationshow);
        }}
        placeholder={t('Where are you going?')}
        backgroundColor={Constants.black}
        getLocationValue={(lat, add) => getLocationValue(lat, add, 'end')}
      />
    </SafeAreaView>
  );
};

export default StopPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    padding: 20,
  },
  topcov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  edittxt: {
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    fontSize: 20,
    marginVertical: 10,
  },
  backcov: {
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.customgrey4,
  },
  stopcov: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: Constants.customgrey5,
    borderRadius: 10,
    // marginTop: 20,
  },
  round: {
    height: 15,
    width: 15,
    borderRadius: 50,
    borderWidth: 4.5,
    borderColor: Constants.dark_green,
  },
  box: {
    height: 15,
    width: 15,
    backgroundColor: Constants.dark_green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row1txt: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    // marginBottom:10,
    // backgroundColor:'white'
    // lineHeight: 14,
  },
  row2txt: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    width: '95%',
    // marginBottom:13,
    // marginTop:3,
    // backgroundColor:'white'
    // lineHeight: 14,
  },
  row1txtsmall: {
    fontSize: 12,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
    // lineHeight: 14,
  },
  stoptxt: {
    fontSize: 10,
    color: Constants.white,
    fontFamily: FONTS.Regular,
    lineHeight: 14,
  },
  row1cov: {
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  verticleline: {
    width: 3,
    backgroundColor: Constants.dark_green,
    height: 28,
    // flex: 1,
  },
  addcov: {
    // backgroundColor:'red',
    height: 30,
    borderBottomWidth: 1,
    borderColor: Constants.customgrey2,
  },
  addcov2: {
    // backgroundColor:'red',
    height: 43,
    borderBottomWidth: 1,
    borderColor: Constants.customgrey2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button2: {
    backgroundColor: Constants.dark_green,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 20,
  },
  buttontxt: {
    color: Constants.white,
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: Constants.dark_green,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 7,
    position:'absolute',
    right:7,
    top:14
  },
});
