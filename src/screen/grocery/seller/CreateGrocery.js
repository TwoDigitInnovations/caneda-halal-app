import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {createRef, useContext, useEffect, useRef, useState} from 'react';
import {BackIcon, Cross2Icon, CrossIcon, Upload2Icon} from '../../../../Theme';
import Constants, {FONTS} from '../../../Assets/Helpers/constant';
import {ApiFormData, GetApi, Post} from '../../../Assets/Helpers/Service';
import CameraGalleryPeacker from '../../../Assets/Component/CameraGalleryPeacker';
import {
  GrocerySellerContext,
  LoadContext,
  ToastContext,
  UserContext,
} from '../../../../App';
import {Dropdown} from 'react-native-element-dropdown';
import {goBack, navigate} from '../../../../navigationRef';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useTranslation } from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';

const CreateGrocery = props => {
  const { t } = useTranslation();
  const cameraRef = createRef();
  const food_id = props?.route?.params?.food_id;
  const dropdownRef = useRef();
  const dropdownRef2 = useRef();
  const [user, setuser] = useContext(UserContext);
  const [tax, setTax] = useState();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [grocerysellerProfile, setgrocerysellerProfile] =
    useContext(GrocerySellerContext);
  const [catlist, setcatlist] = useState([]);
  const [images, setImages] = useState([]);
  const [basicitem, setbasicitem] = useState([]);
  const [fruititems, setfruititems] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);
  const [fooddata, setfooddata] = useState({
    grocerycategory: '',
    categoryName: '',
    name: '',
    short_description: '',
    long_description: '',
    expirydate: new Date(),
    manufacturername: '',
    manufactureradd: '',
    price_slot: [
      {
        value: 0,
        price: 0,
      },
    ],
  });
  const unitData = [
    {name: 'Kg', value: 'kg'},
    {name: 'Gms', value: 'gm'},
    {name: 'Litre', value: 'litre'},
    {name: 'Ml', value: 'ml'},
    {name: 'Piece', value: 'piece'},
    {name: 'Pack', value: 'pack'},
  ];

const scrollRef = useRef();

  useEffect(() => {
    if (fooddata.price_slot.length === 1) {
      scrollRef.current?.scrollTo({ x: 0, animated: true });
    }
  }, [fooddata.price_slot.length]);

  const getImageValue = async img => {
    cameraRef?.current?.hide();
    // setLoading(true);
    console.log(img);
    ApiFormData(img.assets[0]).then(
      res => {
        console.log(res);
        setLoading(false);
        if (res.status) {
          if (images && images.length > 0) {
            setImages(prevImages => [...prevImages, res.data.file]);
          } else {
            setImages([res.data.file]);
          }
        }
      },
      err => {
        setEdit(false);
        console.log(err);
      },
    );
  };

  useEffect(() => {
    getcategory();
    getTax();
  }, []);
  const IsFocused = useIsFocused();
  const navigation = useNavigation();
  useEffect(() => {
    if (IsFocused) {
      if (food_id) {
        getProductById();
      }
    } else {
      setbasicitem([]);
      setfruititems([]);
      setImages([]);
      setfooddata({
        grocerycategory: '',
        categoryName: '',
        name: '',
        long_description: '',
        expirydate: new Date(),
        manufacturername: '',
        manufactureradd: '',
        price_slot: [
          {
            value: 0,
            price: 0,
          },
        ],
      });
      if (food_id) {
        navigation.setParams({food_id: null});
      }
    }
  }, [food_id, IsFocused]);
  const getcategory = () => {
    setLoading(true);
    GetApi(`getGroceryCategory`).then(
      async res => {
        setLoading(false);
        console.log(res);
        setcatlist(res.data);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getTax = () => {
      setLoading(true);
      GetApi(`getTax`).then(
        async res => {
          setLoading(false);
          console.log(res);
          if(res?.data&&res?.data?.length>0){
            setTax(res?.data[0])
          }
        },
        err => {
          setLoading(false);
          console.log(err);
        },
      );
    };
  const getProductById = () => {
    setLoading(true);
    GetApi(`getGroceryById/${food_id}`).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setfooddata(res.data);
          setImages(res?.data?.image);
          // setfooddata({...res?.data, price: (res?.data?.price).toString()});
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const submit = async id => {
    console.log(fooddata);
    console.log(images);
    if (
      fooddata.name === '' ||
      fooddata.grocerycategory === '' ||
      fooddata.categoryName === '' ||
      fooddata.long_description === '' ||
      fooddata.manufacturername === '' ||
      fooddata.manufactureradd === '' ||
      fooddata.short_description === '' ||
      images.length === 0
    ) {
      console.log('enter1');
      setSubmitted(true);
      return;
    }
    if (
      fooddata?.price_slot?.length < 1 ||
      !fooddata?.price_slot[0]?.value ||
      !fooddata?.price_slot[0]?.unit ||
      !fooddata?.price_slot[0]?.our_price ||
      !fooddata?.price_slot[0]?.other_price ||
      fooddata?.price_slot[0]?.value === '' ||
      fooddata?.price_slot[0]?.unit === '' ||
      fooddata?.price_slot[0]?.our_price === '' ||
      fooddata?.price_slot[0]?.other_price === ''
    ) {
      setToast('Please fill all field in slot');
      return;
    }
    console.log('enter2');
    fooddata.image = images;
    fooddata.sellerid = user._id;
    fooddata.seller_profile = grocerysellerProfile._id;
    console.log(images);
    console.log(fooddata);

    let url;
    if (id) {
      url = `updateGrocery`;
      fooddata.id = id;
    } else {
      url = `createGrocery`;
    }
    console.log(url);
    setLoading(true);
    Post(url, fooddata, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setToast(res?.data?.message);
          setfooddata({
            grocerycategory: '',
            categoryName: '',
            name: '',
            long_description: '',
            expirydate: new Date(),
            manufacturername: '',
            manufactureradd: '',
            price_slot: [
              {
                value: 0,
                price: 0,
              },
            ],
          });
          setImages([]);
          navigate('Grocerylist');
        } else {
        }
      },
      err => {
        setLoading(false);
        console.log(err);
        setToast(res?.message);
      },
    );
  };
  return (
    <SafeAreaView style={{flex: 1}}>
    <View style={styles.container}>
      <View style={styles.frowbtn}>
        <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
          <BackIcon color={Constants.black}/>
        </TouchableOpacity>
        <Text style={styles.headtxt1}>{t("Add New Items")}</Text>
        <Text
          style={styles.headtxt2}
          onPress={() => {
            setfooddata({
              grocerycategory: '',
              categoryName: '',
              name: '',
              long_description: '',
              expirydate: new Date(),
              manufacturername: '',
              manufactureradd: '',
              price_slot: [
                {
                  value: 0,
                  price: 0,
                },
              ],
            });
            setImages([]);
            setbasicitem([]);
            setfruititems([]);
          }}>
          {t("Reset")}
        </Text>
      </View>
      <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{flex:1}}
            >
      <ScrollView showsVerticalScrollIndicator={false} style={{width: '100%'}}>
        <View>
          <Text style={[styles.jobtitle]}>{t("ITEM NAME")}</Text>
          <TextInput
            style={[styles.input]}
            placeholderTextColor={Constants.customgrey2}
            placeholder={t("Product name")}
            value={fooddata?.name}
            onChangeText={name => setfooddata({...fooddata, name})}
          />
        </View>
        {submitted && (fooddata.name === '' || !fooddata.name) && (
          <Text style={styles.require}>{t("Name is required")}</Text>
        )}

        <Text style={[styles.jobtitle]}>{t("Upload photos")}</Text>

        <ScrollView
          style={{flexDirection: 'row', marginVertical: 15}}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.uploadbox}
            onPress={() => cameraRef.current.show()}>
            <View style={styles.uplodiconcov}>
              <Upload2Icon
                color={Constants.normal_green}
                height={20}
                width={20}
              />
            </View>
            <Text style={styles.uploadtxt}>{t("Add")}</Text>
          </TouchableOpacity>
          {images &&
            images.length > 0 &&
            images.map((item, i) => (
              <View key={i}>
                <Cross2Icon
                  color={Constants.red}
                  height={15}
                  width={15}
                  style={{position: 'absolute', zIndex: 10, right: 0}}
                  onPress={() =>
                    setImages(prev => prev.filter(it => it !== item))
                  }
                />
                <Image
                  source={{uri: item}}
                  style={styles.imgcov}
                  resizeMode="contain"
                />
              </View>
            ))}
        </ScrollView>
        {submitted && images.length <= 0 && (
          <Text style={styles.require}>{t("Image is required")}</Text>
        )}

        {/* <View>
          <Text style={[styles.jobtitle]}>Price</Text>
          <View style={{flexDirection: 'row'}}>
            <TextInput
              style={[styles.input, {width: '50%'}]}
              placeholderTextColor={Constants.customgrey2}
              placeholder="550"
              value={fooddata?.price}
              onChangeText={price => setfooddata({...fooddata, price})}
            />
            <Text style={styles.amtins}>
              (includes 5% service charge , deducted during payout)
            </Text>
          </View>
        </View>
        {submitted && (fooddata.price === '' || !fooddata.price) && (
          <Text style={styles.require}>Price is required</Text>
        )} */}
        <View>
          <Text style={[styles.jobtitle]}>{t("Select Category")}</Text>
          {fooddata?.grocerycategory?<View style={styles.selcatcov}>
            <Text style={styles.selcattxt}><TranslateHandled text={fooddata?.categoryName} /></Text>
            <CrossIcon color={Constants.red} onPress={()=>setfooddata({
                    ...fooddata,
                    grocerycategory: '',
                    categoryName: '',
                  })}/>
          </View>:<Dropdown
            ref={dropdownRef}
            data={catlist}
            labelField="name"
            valueField="_id"
            placeholder={t("Select categoty")}
            value={fooddata?.grocerycategory}
            onChange={item => {}}
            renderItem={item => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  setfooddata({
                    ...fooddata,
                    grocerycategory: item?._id,
                    categoryName: item?.name,
                  });
                  dropdownRef.current?.close();
                }}>
                <Text style={styles.itemText}><TranslateHandled text={item.name} /></Text>
              </TouchableOpacity>
            )}
            style={styles.dropdown}
            placeholderStyle={styles.placeholder}
            selectedTextStyle={styles.selectedText}
          />}
        </View>
        {submitted &&
          (fooddata.grocerycategory === '' || !fooddata.grocerycategory) && (
            <Text style={styles.require}>{t("Category is required")}</Text>
          )}

        <View>
          <Text style={[styles.jobtitle]}>{t("Short Description")}</Text>
          <TextInput
            style={[styles.input]}
            placeholderTextColor={Constants.customgrey2}
            placeholder={t("Short Description")}
            value={fooddata?.short_description}
            onChangeText={short_description =>
              setfooddata({...fooddata, short_description})
            }
          />
        </View>
        {submitted &&
          (fooddata.short_description === '' ||
            !fooddata.short_description) && (
            <Text style={styles.require}>{t("Short Description is required")}</Text>
          )}
        <View>
          <Text style={[styles.jobtitle]}>{t("Manufacturer Name")}</Text>
          <TextInput
            style={[styles.input]}
            placeholderTextColor={Constants.customgrey2}
            placeholder={t("Enter Manufacturer name")}
            value={fooddata?.manufacturername}
            onChangeText={manufacturername =>
              setfooddata({...fooddata, manufacturername})
            }
          />
        </View>
        {submitted &&
          (fooddata.manufacturername === '' || !fooddata.manufacturername) && (
            <Text style={styles.require}>{t("Manufacturer Name is required")}</Text>
          )}
        <View>
          <Text style={[styles.jobtitle]}>{t("Manufacturer Address")}</Text>
          <TextInput
            style={[styles.input]}
            placeholderTextColor={Constants.customgrey2}
            placeholder={t("Enter Manufacturer address")}
            value={fooddata?.manufactureradd}
            onChangeText={manufactureradd =>
              setfooddata({...fooddata, manufactureradd})
            }
          />
        </View>
        {submitted &&
          (fooddata.manufactureradd === '' || !fooddata.manufactureradd) && (
            <Text style={styles.require}>{t("Manufacturer Address is required")}</Text>
          )}
        <TouchableOpacity onPress={() => setOpen(true)}>
          <Text style={[styles.jobtitle]}>{t("Expiry Date")}</Text>
          <TextInput
            style={[styles.input]}
            placeholderTextColor={Constants.customgrey2}
            placeholder={t("Enter Expiry Date")}
            editable={false}
            value={moment(fooddata.expirydate).format('DD/MM/YYYY')}
          />
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={open}
          mode="date"
          minimumDate={new Date()}
          date={new Date(fooddata?.expirydate)}
          onConfirm={date => {
            setOpen(false);
            setfooddata({...fooddata, expirydate: date});
          }}
          onCancel={() => setOpen(false)}
        />

        <Text style={[styles.jobtitle]}>{t("Details")}</Text>
        <View style={styles.inpucov}>
          <TextInput
            style={styles.inputfield}
            placeholder={t("Long Description")}
            placeholderTextColor={Constants.customgrey2}
            numberOfLines={5}
            multiline={true}
            value={fooddata?.long_description}
            onChangeText={long_description =>
              setfooddata({...fooddata, long_description})
            }></TextInput>
        </View>
        {submitted &&
          (fooddata.long_description === '' || !fooddata.long_description) && (
            <Text style={styles.require}>{t("Long Description is required")}</Text>
          )}
          <View style={styles.addbtncov}>
            <Text style={styles.amtins}>
              {t("(includes 5% service charge in offer price & normal price, deducted during payout)",{tax:tax?.groceryTaxRate})}
            </Text>
        <TouchableOpacity
          style={styles.addbtn}
          onPress={() => {
            setfooddata({
              ...fooddata,
              price_slot: [
                ...fooddata.price_slot,
                {
                  value: 0,
                  price: 0,
                },
              ],
            });
          }}>
          <Text
            style={{
              fontSize: 16,
              color: Constants.white,
              fontFamily: FONTS.Medium,
            }}>
            {t("Add More")}
          </Text>
        </TouchableOpacity>
        </View>
        <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} ref={scrollRef}>
          {fooddata.price_slot.map((item, i) => (
              <View
                style={[
                  styles.box,
                  {
                    marginRight:
                      fooddata?.price_slot.length === i + 1 ? 30 : 10,
                  },
                ]}
                key={i}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.jobtitle}>
                    {i + 1} {':-'} {t("Slot")}
                  </Text>
                  <Cross2Icon
                    height={20}
                    width={20}
                    style={styles.cros}
                    onPress={() => {
                      const slotdata = fooddata.price_slot;
                      slotdata.splice(i, 1),
                        setfooddata({...fooddata, price_slot: slotdata});
                      console.log('pressed');
                    }}
                  />
                </View>
                <View style={styles.textInput2}>
                  <Text style={styles.jobtitle}>{t("Unit")}</Text>
                  <Dropdown
                    ref={dropdownRef2}
                    data={unitData}
                    labelField="name"
                    valueField="value"
                    placeholder={t("Select Unit")}
                    value={item.unit}
                    onChange={item => {}}
                    renderItem={item => (
                      <TouchableOpacity
                        style={styles.itemContainer}
                        onPress={() => {
                          const updatedProducts = [...fooddata.price_slot];
                          updatedProducts[i].unit = item.value;
                          setfooddata({
                            ...fooddata,
                            price_slot: updatedProducts,
                          });
                          dropdownRef2.current?.close();
                        }}>
                        <Text style={styles.itemText}><TranslateHandled text={item.name} /></Text>
                      </TouchableOpacity>
                    )}
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.placeholder}
                    selectedTextStyle={styles.selectedText}
                    itemTextStyle={styles.itemText}
                    itemContainerStyle={styles.itemContainerStyle}
                    selectedItemStyle={styles.selectedStyle}
                  />
                </View>

                <View style={styles.textInput}>
                  <Text style={styles.jobtitle}>{t("Qty")}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t("Enter Qty")}
                    keyboardType="number-pad"
                    placeholderTextColor={Constants.customgrey}
                    value={item.value}
                    onChangeText={value => {
                      item.value = value;
                      setfooddata({
                        ...fooddata,
                      });
                    }}
                  />
                </View>
                <View style={styles.textInput}>
                  <Text style={styles.jobtitle}>{t("Offer Price")}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t("Enter Discounted Price")}
                    keyboardType="number-pad"
                    placeholderTextColor={Constants.customgrey}
                    value={item.our_price?(item.our_price).toString():''}
                    onChangeText={our_price => {
                      item.our_price = our_price;
                      setfooddata({
                        ...fooddata,
                      });
                    }}
                  />
                </View>
                <View style={styles.textInput}>
                  <Text style={styles.jobtitle}>{t("Price")}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t("Enter Price")}
                    keyboardType="number-pad"
                    placeholderTextColor={Constants.customgrey}
                    value={item.other_price?item.other_price.toString():''}
                    onChangeText={other_price => {
                      item.other_price = other_price;
                      setfooddata({
                        ...fooddata,
                      });
                    }}
                  />
                </View>
              </View>
            ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.signInbtn}
          onPress={() => submit(fooddata?._id)}>
          <Text style={styles.buttontxt}>
            {fooddata?._id ? t('Update') : t('Save')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
      <CameraGalleryPeacker
        refs={cameraRef}
        getImageValue={getImageValue}
        base64={false}
        cancel={() => {}}
      />
      </View>
    </SafeAreaView>
  );
};

export default CreateGrocery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    padding: 20,
  },
  backcov: {
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.white,
  },
  frowbtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal:20
  },
  headtxt1: {
    fontSize: 16,
    color: Constants.customgrey,
    fontFamily: FONTS.Medium,
  },
  headtxt2: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.Medium,
    textTransform: 'uppercase',
  },
  jobtitle: {
    color: Constants.dark_green,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    marginTop: 10,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  amtins: {
    color: Constants.normal_green,
    fontSize: 12,
    fontFamily: FONTS.Medium,
    // width: '60%',
    flex:1,
    // textTransform: 'uppercase',
    // textAlign:'center',
    alignSelf: 'center',
    marginHorizontal: 10,
  },
  tittxt: {
    color: Constants.dark_green,
    fontSize: 14,
    fontFamily: FONTS.Regular,
    // marginTop: 10,
    marginBottom: 5,
  },
  input: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    borderRadius: 10,
    // backgroundColor:'red',
    height: 55,
    lineHeight: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
  },
  inputfield: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    flex: 1,
    textAlignVertical: 'top',
    // backgroundColor: Constants.red
  },
  inpucov: {
    // backgroundColor: Constants.customgrey,
    // marginVertical: 10,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
    borderRadius: 15,
    height: 100,
    paddingHorizontal: 10,
  },
  iconcov: {
    height: 50,
    width: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Constants.customgrey2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seliconcov: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#F3FFE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconname: {
    color: Constants.black,
    fontSize: 12,
    fontFamily: FONTS.Medium,
  },
  uploadbox: {
    alignItems: 'center',
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Constants.customgrey2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgcov: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginLeft: 5,
  },
  uploadtxt: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
  },
  uplodiconcov: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#bcb8cc',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dropdown: {
    borderRadius: 10,
    // backgroundColor:'red',
    height: 55,
    padding: 10,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
  },
  placeholder: {
    color: Constants.customgrey2,
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
  require: {
    color: Constants.red,
    fontFamily: FONTS.Medium,
    marginLeft: 10,
    fontSize: 14,
    marginTop: 10,
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
  box: {
    borderWidth: 1,
    borderColor: Constants.normal_green,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: 300,
  },
  addbtncov:{flexDirection: 'row', alignItems: 'center',justifyContent:'space-between',marginVertical:10,},
  addbtn: {
    borderRadius: 10,
    backgroundColor: Constants.normal_green,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    // marginTop: 20,
  },
  dropdownContainer: {
    borderRadius: 12,
    backgroundColor: Constants.normal_green,
  },
  selectedStyle: {
    backgroundColor: Constants.normal_green,
  },
  itemContainerStyle: {
    borderBottomWidth: 1,
    borderColor: Constants.customgrey,
    backgroundColor: Constants.normal_green,
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
  }
});
