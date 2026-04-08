import {
  Button,
  FlatList,
  Image,
  KeyboardAvoidingView,
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
import React, {createRef, useContext, useEffect, useRef, useState} from 'react';
import {BackIcon, Cross2Icon, CrossIcon, Upload2Icon} from '../../../../Theme';
import Constants, {FONTS} from '../../../Assets/Helpers/constant';
import {
  ApiFormData,
  GetApi,
  Post,
  Postwithimage,
} from '../../../Assets/Helpers/Service';
import CameraGalleryPeacker from '../../../Assets/Component/CameraGalleryPeacker';
import {
  ShoppingSellerContext,
  LoadContext,
  ToastContext,
  UserContext,
} from '../../../../App';
import {Dropdown} from 'react-native-element-dropdown';
import {goBack, navigate} from '../../../../navigationRef';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider,
} from 'reanimated-color-picker';
import {runOnJS} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';

const CreateShopping = props => {
  const { t } = useTranslation();
  const cameraRef = createRef();
  const food_id = props?.route?.params?.food_id;
  const dropdownRef = useRef();
  const dropdownRef2 = useRef();
  const [tax, setTax] = useState();
  const [user, setuser] = useContext(UserContext);
  const [selectcat, setSelectcat] = useState();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [shoppingsellerProfile, setshoppingsellerProfile] = useContext(
    ShoppingSellerContext,
  );
  const [catlist, setcatlist] = useState([]);
  const [images, setImages] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);
  const [fooddata, setfooddata] = useState({
    shoppingcategory: '',
    categoryName: '',
    name: '',
    short_description: '',
    long_description: '',
    // expirydate: new Date(),
    manufacturername: '',
    manufactureradd: '',
    // price_slot: [
    //   {
    //     value: 0,
    //     price: 0,
    //   },
    // ],
  });
  const [variants, setVariants] = useState([
    {
      color: '',
      image: [],
      selected: [
        {
          label: 'Size',
          value: '',
          total: '',
          sell: 0,
          our_price: '',
          other_price: '',
        },
      ],
    },
  ]);
  const [selectedimgind, setselectedimgind] = useState(null);
  const [selectedColind, setselectedColind] = useState(null);

  const [showModal, setShowModal] = useState(false);


const updateColorInVariant = (hex) => {
  const updatedVariants = [...variants];
  updatedVariants[selectedColind] = {
    ...updatedVariants[selectedColind],
    color: hex,
  };
  setVariants(updatedVariants);
};

const onSelectColor = ({ hex }) => {
    'worklet';
    if (runOnJS) {
      runOnJS(updateColorInVariant)(hex); 
    }
  };

  const SIZE_LIST = [
    {label: 'XXS', value: 'XXS', total: 0, sell: 0},
    {label: 'XS', value: 'XS', total: 0, sell: 0},
    {label: 'S', value: 'S', total: 0, sell: 0},
    {label: 'M', value: 'M', total: 0, sell: 0},
    {label: 'L', value: 'L', total: 0, sell: 0},
    {label: 'XL', value: 'XL', total: 0, sell: 0},
    {label: 'XXL', value: 'XXL', total: 0, sell: 0},
    {label: '3XL', value: '3XL', total: 0, sell: 0},
    {label: '4XL', value: '4XL', total: 0, sell: 0},
    {label: '5XL', value: '5XL', total: 0, sell: 0},
    {label: '28', value: '28', total: 0, sell: 0},
    {label: '30', value: '30', total: 0, sell: 0},
    {label: '32', value: '32', total: 0, sell: 0},
    {label: '34', value: '34', total: 0, sell: 0},
    {label: '36', value: '36', total: 0, sell: 0},
    {label: '38', value: '38', total: 0, sell: 0},
    {label: '40', value: '40', total: 0, sell: 0},
    {label: '42', value: '42', total: 0, sell: 0},
  ];

  const scrollRef = useRef();

  // useEffect(() => {
  //   if (variants.length === 1) {
  //     scrollRef.current?.scrollTo({x: 0, animated: true});
  //   }
  // }, [variants.length]);

  // const getImageValue = async img => {
  //   cameraRef?.current?.hide();
  //   // setLoading(true);
  //   console.log(img);
  //   ApiFormData(img.assets[0]).then(
  //     res => {
  //       console.log(res);
  //       setLoading(false);
  //       if (res.status) {
  //         if (images && images.length > 0) {
  //           setImages(prevImages => [...prevImages, res.data.file]);
  //         } else {
  //           setImages([res.data.file]);
  //         }
  //       }
  //     },
  //     err => {
  //       setEdit(false);
  //       console.log(err);
  //     },
  //   );
  // };

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
      setImages([]);
      setfooddata({
        shoppingcategory: '',
        categoryName: '',
        name: '',
        long_description: '',
        // expirydate: new Date(),
        manufacturername: '',
        manufactureradd: '',
        // price_slot: [
        //   {
        //     value: 0,
        //     price: 0,
        //   },
        // ],
      });
      setVariants([
        {
      color: '',
      image: [],
      selected: [
        {
          label: 'Size',
          value: '',
          total: '',
          sell: 0,
          our_price: '',
          other_price: '',
        },
      ],
    },
      ])
      if (food_id) {
        navigation.setParams({food_id: null});
      }
    }
  }, [food_id, IsFocused]);
  const getcategory = () => {
    setLoading(true);
    GetApi(`getShoppingCategory`).then(
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
    GetApi(`getShoppingById/${food_id}`).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setfooddata(res.data);
          setVariants(res?.data?.variants)
          // setImages(res?.data?.image);
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
    console.log(variants);
    if (
      fooddata.name === '' ||
      fooddata.shoppingcategory === '' ||
      fooddata.categoryName === '' ||
      fooddata.long_description === '' ||
      fooddata.manufacturername === '' ||
      fooddata.manufactureradd === '' ||
      fooddata.short_description === ''
    ) {
      console.log('enter1');
      setSubmitted(true);
      return;
    }
if (
  variants.some((item) => {
    console.log('item =====>', item);
    return (
      !item?.color || item.color === '' ||
      item?.image?.some((it) => !it || it === '') ||
      item?.selected?.some(
        (it) =>
          !it?.our_price || it.our_price === '' ||
          !it?.other_price || it.other_price === '' ||
          !it?.value || it.value === ''
      )
    );
  })
) {
  setToast("Please fill all the fields");
  return;
}

    fooddata.sellerid = user._id;
    fooddata.seller_profile = shoppingsellerProfile._id;
    fooddata.variants = variants;
    console.log(fooddata);

    let url;
    if (id) {
      url = `updateShopping`;
      fooddata.id = id;
    } else {
      url = `createShopping`;
    }
    console.log(url);
    setLoading(true);

    // let formdata = new FormData();
    //     formdata.append('name', fooddata.name);
    //     formdata.append('shoppingcategory', fooddata.shoppingcategory);
    //     formdata.append('categoryName', fooddata.categoryName);
    //     formdata.append('long_description', fooddata.long_description);
    //     formdata.append('short_description', fooddata.short_description);
    //     formdata.append('manufacturername', fooddata.manufacturername);
    //     formdata.append('manufactureradd', fooddata.manufactureradd);
    //     formdata.append('sellerid', fooddata.sellerid);
    //     formdata.append('seller_profile', fooddata.seller_profile);

    //    // Variants with both images (files or URLs)
    // const variantsToSend = [...variants];
    // let fileIndex = 0;

    // variantsToSend.forEach((variant, i) => {
    //   const newImageList = [];

    //   variant.image.forEach((img) => {
    //     if (img instanceof File) {
    //       // It's a file, send it via formdata
    //       formdata.append('file', img);
    //       newImageList.push({ type: 'file', index: fileIndex++ });
    //     } else {
    //       // Already uploaded URL
    //       newImageList.push({ type: 'url', url: img });
    //     }
    //   });

    //   variant.image = newImageList; // Replace images with metadata
    // });

    // // Add updated variants (as JSON string)
    // formdata.append('variants', JSON.stringify(variantsToSend));

    Post(url, fooddata).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setToast(res?.data?.message);
          setfooddata({
            shoppingcategory: '',
            categoryName: '',
            name: '',
            long_description: '',
            // expirydate: new Date(),
            manufacturername: '',
            manufactureradd: '',
          });
          setVariants([
            {
              color: '',
              image: [],
              selected: [
                {
                  label: 'Size',
                  value: '',
                  total: '',
                  sell: 0,
                  our_price: '',
                  other_price: '',
                },
              ],
            },
          ]);
          navigate('Shoppinglist');
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
              shoppingcategory: '',
              categoryName: '',
              name: '',
              long_description: '',
              // expirydate: new Date(),
              manufacturername: '',
              manufactureradd: '',
              // price_slot: [
              //   {
              //     value: 0,
              //     price: 0,
              //   },
              // ],
            });
            setImages([]);
            setbasicitem([]);
            setfruititems([]);
          }}>
          Reset
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

        {/* {submitted && images.length <= 0 && (
          <Text style={styles.require}>Image is required</Text>
        )} */}

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
          {fooddata?.shoppingcategory?<View style={styles.selcatcov}>
            <Text style={styles.selcattxt}><TranslateHandled text={fooddata?.categoryName} /></Text>
            <CrossIcon color={Constants.red} onPress={()=>setfooddata({
                    ...fooddata,
                    shoppingcategory: '',
                    categoryName: '',
                  })}/>
          </View>:<Dropdown
            ref={dropdownRef}
            data={catlist}
            labelField="name"
            valueField="_id"
            placeholder={t("Select categoty")}
            value={fooddata?.shoppingcategory}
            onChange={item => {}}
            renderItem={item => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  setfooddata({
                    ...fooddata,
                    shoppingcategory: item?._id,
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
          (fooddata.shoppingcategory === '' || !fooddata.shoppingcategory) && (
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
        {/* <TouchableOpacity onPress={() => setOpen(true)}>
          <Text style={[styles.jobtitle]}>Expiry Date</Text>
          <TextInput
            style={[styles.input]}
            placeholderTextColor={Constants.customgrey2}
            placeholder="Enter Expiry Date"
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
        /> */}

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
            {t("(includes 5% service charge in offer price & normal price, deducted during payout)",{tax:tax?.shoppingTaxRate})}
          </Text>
          <TouchableOpacity
            style={styles.addbtn}
            onPress={() => {
              setVariants([
                ...variants,
                {
                  color: '',
                  image: [],
                  selected: [
                    {
                      label: 'Size',
                      value: '',
                      total: '',
                      sell: 0,
                      our_price: '',
                      other_price: '',
                    },
                  ],
                },
              ]);
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
        {/* <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          ref={scrollRef}> */}
        {variants.map((item, i) => (
          <View
            style={[
              styles.box,
              // {
              //   marginRight: variants.length === i + 1 ? 30 : 10,
              // },
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
                  const slotdata = variants;
                  slotdata.splice(i, 1),
                    // setfooddata({...fooddata, price_slot: slotdata});
                    setVariants([...slotdata]);
                  console.log('pressed');
                }}
              />
            </View>
            <Text style={[styles.jobtitle]}>{t("Upload photos")}</Text>

            <ScrollView
              style={{flexDirection: 'row', marginVertical: 15}}
              horizontal={true}
              showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.uploadbox}
                onPress={() => {
                  cameraRef.current.show(), setselectedimgind(i);
                }}>
                <View style={styles.uplodiconcov}>
                  <Upload2Icon
                    color={Constants.normal_green}
                    height={20}
                    width={20}
                  />
                </View>
                <Text style={styles.uploadtxt}>{t("Add")}</Text>
              </TouchableOpacity>
              {item?.image &&
                item?.image.length > 0 &&
                item?.image.map((imgitem, imgi) => (
                  <View key={imgi}>
                    <Cross2Icon
                      color={Constants.red}
                      height={15}
                      width={15}
                      style={{position: 'absolute', zIndex: 10, right: 0}}
                      onPress={() => {
                        const updatedVariants = [...variants];
                        updatedVariants[i].image = updatedVariants[
                          i
                        ].image.filter(img => img !== imgitem);
                        setVariants(updatedVariants);
                      }}
                    />
                    {imgitem && (
                      <Image
                        source={{uri: imgitem}}
                        style={styles.imgcov}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                ))}
            </ScrollView>
            <CameraGalleryPeacker
              refs={cameraRef}
              getImageValue={img => {
                cameraRef?.current?.hide();
                //             const imagedata = {
                //   name: img.assets[0].fileName,
                //   type: img.assets[0].type,
                //   uri: img.assets[0].uri,
                // };
                ApiFormData(img.assets[0]).then(
                  res => {
                    console.log(res);
                    setLoading(false);
                    if (res.status) {
                      const updatedVariants = [...variants];
                      const images =
                        updatedVariants[selectedimgind].image || [];
                      // setSelectedImageFiles(prev => [...prev, res.data.file]);
                      updatedVariants[selectedimgind] = {
                        ...updatedVariants[selectedimgind],
                        image: [...images, res.data.file],
                      };
                      setVariants(updatedVariants);
                    }
                  },
                  err => {
                    setEdit(false);
                    console.log(err);
                  },
                );
              }}
              base64={false}
              cancel={() => {}}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
              }}>
              <View>
                <Text style={[styles.jobtitle, {lineHeight: 15}]}>
                  {t("Select Colour")}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.colorbox,
                    {
                      backgroundColor: item?.color
                        ? item?.color
                        : Constants.white,
                    },
                  ]}
                  onPress={() => {setShowModal(true),setselectedColind(i)}}></TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.addbtn2}
                onPress={() => {
                  const updatedVariants = [...variants];
                  updatedVariants[i] = {
                    ...updatedVariants[i],
                    selected: [
                      ...updatedVariants[i].selected,
                      {
                        label: 'Size',
                        value: '',
                        total: '',
                        sell: 0,
                        our_price: '',
                        other_price: '',
                      },
                    ],
                  };
                  setVariants(updatedVariants);
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: Constants.white,
                    fontFamily: FONTS.Medium,
                  }}>
                  {t("Add Slot")}
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              // style={{flexDirection: 'row', marginVertical: 15}}
              ref={scrollRef}
              horizontal={true}
              showsHorizontalScrollIndicator={false}>
              {item?.selected.map((it, ind) => (
                <View
                  style={[
                    styles.box2,
                    {
                      marginRight: item?.selected?.length === i + 1 ? 30 : 10,
                    },
                  ]}
                  key={ind}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.jobtitle}>
                      {t("Size Slot")} {':-'} {ind + 1}
                    </Text>
                    <Cross2Icon
                      height={20}
                      width={20}
                      style={styles.cros}
                      onPress={() => {
                        // const slotdata = item;
                        // slotdata.splice(i, 1),
                        //   setVariants([...slotdata]);
                        const updatedVariants = [...variants];
                        updatedVariants[i].selected.splice(i, 1);
                        setVariants([...updatedVariants]);
                        if (item?.selected?.length === 1) {
                          scrollRef.current?.scrollTo({x: 0, animated: true});
                        }
                      }}
                    />
                  </View>
                  <View style={styles.textInput2}>
                    <Text style={styles.jobtitle}>{t("Size")}</Text>
                    <Dropdown
                      ref={dropdownRef2}
                      data={SIZE_LIST}
                      labelField="label"
                      valueField="value"
                      placeholder={t("Select Size")}
                      value={it.value}
                      onChange={item => {}}
                      renderItem={dditem => (
                        <TouchableOpacity
                          style={styles.itemContainer}
                          onPress={() => {
                            const updatedVariants = [...variants];
                            updatedVariants[i].selected[ind].value =
                              dditem?.value;
                            setVariants(updatedVariants);
                            // it.value=dditem,
                            // setVariants([...item])
                            dropdownRef2.current?.close();
                          }}>
                          {/* <Text style={styles.itemText}>{dditem.label}</Text> */}
                          <Text style={styles.itemText}><TranslateHandled text={dditem.label} /></Text>
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
                      value={it.total}
                      onChangeText={e => {
                        const updatedVariants = [...variants];
                        updatedVariants[i].selected[ind].total = e;
                        setVariants(updatedVariants);
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
                      value={it.our_price}
                      onChangeText={e => {
                        const updatedVariants = [...variants];
                        updatedVariants[i].selected[ind].our_price = e;
                        setVariants(updatedVariants);
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
                      value={it.other_price}
                      onChangeText={e => {
                        const updatedVariants = [...variants];
                        updatedVariants[i].selected[ind].other_price = e;
                        setVariants(updatedVariants);
                      }}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        ))}
        {/* </ScrollView> */}
        <TouchableOpacity
          style={styles.signInbtn}
          onPress={() => submit(fooddata?._id)}>
          <Text style={styles.buttontxt}>
            {fooddata?._id ? t('Update') : t('Save')}
          </Text>
        </TouchableOpacity>
        <Modal visible={showModal} animationType="slide" transparent={true}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {/* <View style={{backgroundColor: 'white', alignItems: 'center'}}> */}
                <ColorPicker
                  // style={{width: '70%'}}
                  value="red"
                  onComplete={onSelectColor}>
                  <Preview />
                  <Panel1 />
                  <HueSlider />
                  <OpacitySlider />
                  <Swatches />
                </ColorPicker>

                <TouchableOpacity style={styles.btn} onPress={() => setShowModal(false)}><Text style={styles.btntxt}>Confirm</Text></TouchableOpacity>
              {/* </View> */}
            </View>
          </View>
        </Modal>
      </ScrollView>
      </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default CreateShopping;

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
    flex: 1,
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
    // width: 300,
  },
  box2: {
    borderWidth: 1,
    borderColor: Constants.dark_green,
    borderRadius: 10,
    padding: 7,
    marginBottom: 10,
    width: 300,
  },
  addbtncov: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
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
  addbtn2: {
    borderRadius: 10,
    backgroundColor: Constants.normal_green,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginVertical: 10,
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
  colorbox: {
    borderWidth: 1,
    borderColor: Constants.normal_green,
    borderRadius: 10,
    height: 30,
    // width:'50%',
    marginBottom: 10,
  },
      centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      // marginTop: 22,
      backgroundColor: '#rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      margin: 17,
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      position: 'relative',
      width:'90%'
    },
    btn:{
      backgroundColor:Constants.normal_green,
      borderRadius:10,
      width:'100%',
      paddingVertical:7,
      justifyContent:'center',
      alignItems:'center'
    },
    btntxt:{
      fontSize:16,
      fontFamily:FONTS.Medium,
      color:Constants.white
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
