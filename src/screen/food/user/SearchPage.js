import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {BackIcon, SearchIcon, UnfavIcon} from '../../../../Theme';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {LoadContext, ToastContext, UserContext} from '../../../../App';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import { goBack, navigate } from '../../../../navigationRef';
import { useTranslation } from 'react-i18next';

const SearchPage = () => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setUser] = useContext(UserContext);
  const [productlist, setproductlist] = useState([]);
  const [searchkey, setsearchkey] = useState('');
  const [page, setPage] = useState(1);
  const [curentData, setCurrentData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 200);
  }, []);

  const getsearchproducts = (p, text) => {
    setPage(p);
    // setLoading(true);
    console.log(p);
    GetApi(`foodSearch?page=${p}&key=${text}&userId=${user?._id}`).then(
      async res => {
        // setLoading(false);
        console.log(res);
        // setproductlist(res);
        setCurrentData(res.data);
        if (p === 1) {
          setproductlist(res.data);
        } else {
          setproductlist([...productlist, ...res.data]);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
    const togglefav = (id) => {
    setLoading(true);
    const data = {
      foodid:id
    }
    Post(`togglefavorite`,data).then(
      async res => {
        setLoading(false);
        getsearchproducts(page, searchkey)
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const fetchNextPage = () => {
    if (curentData.length === 20) {
      getsearchproducts(page + 1, searchkey);
    }
  };
  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      <View style={styles.rowbetw}>
        <TouchableOpacity style={styles.iconcov} onPress={()=>goBack()}>
          <BackIcon color={Constants.black}/>
        </TouchableOpacity>
        <Text style={styles.headtxt}>{t("Search Food")}</Text>
        <View></View>
      </View>
      <View style={styles.aplcov}>
        <SearchIcon
          height={25}
          width={25}
          style={{alignSelf: 'center'}}
          color={Constants.customgrey3}
        />
        <TextInput
          placeholder={t("Search Food")}
          placeholderTextColor={Constants.customgrey2}
          style={styles.protxtinp}
          ref={inputRef}
          onChangeText={name => {
            getsearchproducts(1, name), setsearchkey(name);
          }}
        />
      </View>
      {productlist && productlist.length > 0 ? (
        <FlatList
          data={productlist}
          style={{marginTop: 15, marginRight: 15}}
          numColumns={2}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.prodbox}
              onPress={() => navigate('PreView', item?._id)}>
              <Image
                source={{uri: item?.image[0]}}
                style={{height: 106, width: '100%', borderRadius: 10}}
              />
              <Text style={styles.proname}>{item?.name}</Text>
              <Text style={styles.pricetxt}>{Currency} {item?.price}</Text>
              <TouchableOpacity style={styles.faviconcov} onPress={() => togglefav(item?._id)}>
                            <UnfavIcon color={item?.isFavorite?'#F14141':null}/>
                          </TouchableOpacity>
            </TouchableOpacity>
          )}
          onEndReached={() => {
            if (productlist && productlist.length > 0) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.05}
        />
      ) : (
        <View>
          <Image
            source={require('../../../Assets/Images/cart.png')}
            style={{alignSelf: 'center', marginVertical: 70}}
          />
          <Text style={styles.empttxt}>{t("We couldn't find any result!")}</Text>
          <Text style={styles.empttxt2}>
            {t("Please check your search for any typos or spelling errors, or try a different search term.")}
          </Text>
        </View>
      )}
    </View>
    </SafeAreaView>
  );
};

export default SearchPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS==='ios'?10:20,
  },
  headtxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  iconcov: {
    borderWidth: 1,
    borderColor: Constants.customgrey2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    padding: 5,
  },
  rowbetw: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aplcov: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Constants.customgrey2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 25,
    height:50
  },
  protxtinp: {
    flex: 1,
    paddingHorizontal: 10,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    fontSize: 14,
  },
  empttxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Bold,
    textAlign: 'center',
    marginVertical: 10,
  },
  empttxt2: {
    fontSize: 16,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
    pricetxt: {
    fontSize: 14,
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
    alignSelf: 'flex-start',
  },
  proname: {
    fontSize: 14,
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  prodbox: {
    marginHorizontal: 10,
    width: '47%',
    // flex: 1,
    // backgroundColor: Constants.red,
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    boxShadow: '0 0 6 0.5 grey',
  },
    faviconcov: {
    height: 30,
    width: 30,
    borderRadius:30,
    backgroundColor: Constants.white,
    position: 'absolute',
    top: 15,
    right: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
