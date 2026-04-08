import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {createRef, useContext, useEffect, useRef, useState} from 'react';
import {
  AppleIcon,
  AvocadoIcon,
  BackIcon,
  BlueberryIcon,
  BroccoliIcon,
  ChickenIcon,
  ChiliIcon,
  Cross2Icon,
  CrossIcon,
  GarlicIcon,
  GingerIcon,
  OnionIcon,
  OrangeIcon,
  SaltIcon,
  Upload2Icon,
  WalnutIcon,
} from '../../../../Theme';
import Constants, {FONTS} from '../../../Assets/Helpers/constant';
import {ApiFormData, GetApi, Post} from '../../../Assets/Helpers/Service';
import CameraGalleryPeacker from '../../../Assets/Component/CameraGalleryPeacker';
import {
  FoodSellerContext,
  LoadContext,
  ToastContext,
  UserContext,
} from '../../../../App';
import {Dropdown} from 'react-native-element-dropdown';
import {goBack, navigate} from '../../../../navigationRef';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';

const CreateFood = props => {
  const { t } = useTranslation();
  const cameraRef = createRef();
  const food_id = props?.route?.params?.food_id;
  const dropdownRef = useRef();
  const [user, setuser] = useContext(UserContext);
  const [tax, setTax] = useState();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [foodsellerProfile, setfoodsellerProfile] =
    useContext(FoodSellerContext);
  const [catlist, setcatlist] = useState([]);
  const [images, setImages] = useState([]);
  const [basicitem, setbasicitem] = useState([]);
  const [fruititems, setfruititems] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [fooddata, setfooddata] = useState({
    foodcategory: '',
    categoryName: '',
    name: '',
    description: '',
    price: '',
  });
  const basicdata = [
    {
      iconActive: (
        <SaltIcon color={Constants.normal_green} height={24} width={24} />
      ),
      iconInActive: <SaltIcon color={Constants.black} height={24} width={24} />,
      name: 'Salt',
      value: 'salt',
    },
    {
      iconActive: (
        <ChickenIcon color={Constants.normal_green} height={24} width={24} />
      ),
      iconInActive: (
        <ChickenIcon color={Constants.black} height={24} width={24} />
      ),
      name: 'Chicken',
      value: 'Chicken',
    },
    {
      iconActive: (
        <OnionIcon color={Constants.normal_green} height={24} width={24} />
      ),
      iconInActive: (
        <OnionIcon color={Constants.black} height={24} width={24} />
      ),
      name: 'Onion',
      value: 'Onion',
    },
    {
      iconActive: (
        <GarlicIcon color={Constants.normal_green} height={24} width={24} />
      ),
      iconInActive: (
        <GarlicIcon color={Constants.black} height={24} width={24} />
      ),
      name: 'Garlic',
      value: 'Garlic',
    },
    {
      iconActive: (
        <ChiliIcon color={Constants.normal_green} height={24} width={24} />
      ),
      iconInActive: (
        <ChiliIcon color={Constants.black} height={24} width={24} />
      ),
      name: 'Chili',
      value: 'Chili',
    },
    {
      iconActive: (
        <GingerIcon color={Constants.normal_green} height={24} width={24} />
      ),
      iconInActive: (
        <GingerIcon color={Constants.black} height={24} width={24} />
      ),
      name: 'Ginger',
      value: 'Ginger',
    },
  ];
  const fruitdata = [
    {
      iconActive: (
        <AvocadoIcon color={Constants.normal_green} height={24} width={24} />
      ),
      iconInActive: (
        <AvocadoIcon color={Constants.black} height={24} width={24} />
      ),
      name: 'Avocado',
      value: 'Avocado',
    },
    {
      iconActive: (
        <AppleIcon color={Constants.normal_green} height={24} width={24} />
      ),
      iconInActive: (
        <AppleIcon color={Constants.black} height={24} width={24} />
      ),
      name: 'Apple',
      value: 'Apple',
    },
    {
      iconActive: (
        <BlueberryIcon color={Constants.normal_green} height={24} width={24} />
      ),
      iconInActive: (
        <BlueberryIcon color={Constants.black} height={24} width={24} />
      ),
      name: 'Blueberry',
      value: 'Blueberry',
    },
    {
      iconActive: (
        <BroccoliIcon color={Constants.normal_green} height={24} width={24} />
      ),
      iconInActive: (
        <BroccoliIcon color={Constants.black} height={24} width={24} />
      ),
      name: 'Broccoli',
      value: 'Broccoli',
    },
    {
      iconActive: (
        <OrangeIcon color={Constants.normal_green} height={24} width={24} />
      ),
      iconInActive: (
        <OrangeIcon color={Constants.black} height={24} width={24} />
      ),
      name: 'Orange',
      value: 'Orange',
    },
    {
      iconActive: (
        <WalnutIcon color={Constants.normal_green} height={24} width={24} />
      ),
      iconInActive: (
        <WalnutIcon color={Constants.black} height={24} width={24} />
      ),
      name: 'Walnut',
      value: 'Walnut',
    },
  ];
  const getImageValue = async img => {
    cameraRef?.current?.hide()
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
        foodcategory: '',
        categoryName: '',
        name: '',
        description: '',
        price: '',
      });
      if (food_id) {
        navigation.setParams({food_id:null} );
      }
    }
  }, [food_id, IsFocused]);
  const getcategory = () => {
    setLoading(true);
    GetApi(`getFoodCategory`).then(
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
    GetApi(`getFoodById/${food_id}`).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          // setfooddata(res.data);
          setbasicitem(res?.data?.basic_ingridient);
          setfruititems(res?.data?.food_ingridient);
          setImages(res?.data?.image);
          setfooddata({...res?.data, price: (res?.data?.price).toString()});
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
      fooddata.foodcategory === '' ||
      fooddata.categoryName === '' ||
      fooddata.description === '' ||
      fooddata.price === '' ||
      images.length === 0
    ) {
      console.log('enter1');
      setSubmitted(true);
      return;
    }
    console.log('enter2');
    fooddata.image = images;
    fooddata.sellerid = user._id;
    fooddata.seller_profile = foodsellerProfile._id;
    fooddata.basic_ingridient = basicitem;
    fooddata.food_ingridient = fruititems;
    console.log(images);
    console.log(fooddata);

    let url;
    if (id) {
      url = `updateFood`;
      fooddata.id = id;
    } else {
      url = `createFood`;
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
            foodcategory: '',
            categoryName: '',
            name: '',
            description: '',
            price: '',
          });
          setImages([]);
          navigate('Foodlist');
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
    <SafeAreaView style={{flex:1}}>
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
              foodcategory: '',
              categoryName: '',
              name: '',
              description: '',
              price: '',
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
      <ScrollView showsVerticalScrollIndicator={false} style={{flex:1}}>
        <View>
          <Text style={[styles.jobtitle]}>{t("ITEM NAME")}</Text>
          <TextInput
            style={[styles.input]}
            placeholderTextColor={Constants.customgrey2}
            placeholder={t("Mazalichiken Halim")}
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

        <View>
          <Text style={[styles.jobtitle]}>{t("Price")}</Text>
          <View style={{flexDirection: 'row'}}>
            <TextInput
              style={[styles.input, {width: '50%'}]}
              placeholderTextColor={Constants.customgrey2}
              placeholder="550"
              value={fooddata?.price}
              onChangeText={price => setfooddata({...fooddata, price})}
            />
            <Text style={styles.amtins}>
              {t("(includes 5% service charge , deducted during payout)",{tax:tax?.foodTaxRate})}
            </Text>
          </View>
        </View>
        {submitted && (fooddata.price === '' || !fooddata.price) && (
          <Text style={styles.require}>{t("Price is required")}</Text>
        )}
        <View>
          <Text style={[styles.jobtitle]}>{t("Select Category")}</Text>
          {fooddata?.foodcategory?<View style={styles.selcatcov}>
            <Text style={styles.selcattxt}><TranslateHandled text={fooddata?.categoryName} /></Text>
            <CrossIcon color={Constants.red} onPress={()=>setfooddata({
                    ...fooddata,
                    foodcategory: '',
                    categoryName: '',
                  })}/>
          </View>:<Dropdown
            ref={dropdownRef}
            data={catlist}
            labelField="name"
            valueField="_id"
            placeholder={t("Select categoty")}
            value={fooddata?.foodcategory}
            onChange={item => {}}
            renderItem={item => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  setfooddata({
                    ...fooddata,
                    foodcategory: item?._id,
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
          (fooddata.foodcategory === '' || !fooddata.foodcategory) && (
            <Text style={styles.require}>{t("Category is required")}</Text>
          )}

        <Text style={[styles.jobtitle]}>{t("INGRIDENTS")}</Text>
        <View>
          <Text style={styles.tittxt}>{t("Basic")}</Text>
          <FlatList
            data={basicdata}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            renderItem={({item}) => (
              <TouchableOpacity
                style={{marginHorizontal: 10, alignItems: 'center'}}
                onPress={() => {
                  const alreadyinit = basicitem.includes(item.name);
                  if (alreadyinit) {
                    setbasicitem(prevItems =>
                      prevItems.filter(it => it !== item.name),
                    );
                  } else {
                    setbasicitem(prevItems => [...prevItems, item.name]);
                  }
                }}>
                <View
                  style={[
                    basicitem.includes(item.name)
                      ? styles.seliconcov
                      : styles.iconcov,
                  ]}>
                  {item.iconActive}
                </View>
                <Text style={styles.iconname}>{t(item.name)}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={{marginVertical: 10}}>
          <Text style={styles.tittxt}>{t("Fruit")}</Text>
          <FlatList
            data={fruitdata}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            renderItem={({item}) => (
              <TouchableOpacity
                style={{marginHorizontal: 10, alignItems: 'center'}}
                onPress={() => {
                  const alreadyinit = fruititems.includes(item.name);
                  if (alreadyinit) {
                    setfruititems(prevItems =>
                      prevItems.filter(it => it !== item.name),
                    );
                  } else {
                    setfruititems(prevItems => [...prevItems, item.name]);
                  }
                }}>
                <View
                  style={[
                    fruititems.includes(item.name)
                      ? styles.seliconcov
                      : styles.iconcov,
                  ]}>
                  {item.iconActive}
                </View>
                <Text style={styles.iconname}>{t(item.name)}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <Text style={[styles.jobtitle]}>{t("Details")}</Text>
        <View style={styles.inpucov}>
          <TextInput
            style={styles.inputfield}
            placeholder={t("Description")}
            placeholderTextColor={Constants.customgrey2}
            numberOfLines={5}
            multiline={true}
            value={fooddata?.description}
            onChangeText={description =>
              setfooddata({...fooddata, description})
            }></TextInput>
        </View>
        {submitted &&
          (fooddata.description === '' || !fooddata.description) && (
            <Text style={styles.require}>{t("Description is required")}</Text>
          )}
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

export default CreateFood;

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
    width: '50%',
    // textTransform: 'uppercase',
    // textAlign:'center',
    alignSelf: 'center',
    marginLeft: 10,
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
