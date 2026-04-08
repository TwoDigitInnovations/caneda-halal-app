import {StyleSheet, Dimensions, Platform} from 'react-native';
import Constants, {FONTS} from '../../Assets/Helpers/constant';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    // padding: 20,
  },
  headtxt: {
    color: Constants.black,
    fontFamily: FONTS.Medium,
    fontSize: 18,
    marginVertical: 20,
  },
  inputfield: {
    color: Constants.dark_green,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    backgroundColor: Constants.white,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    flex: 1,
  },
  inputfieldcov: {
    backgroundColor: Constants.white,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    // height:60,
    // paddingHorizontal:10,
    flex: 1,
    flexDirection:'row',
    alignItems:'center',
    paddingLeft:4,
    height:50
    // gap:4
  },
  inpcov: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: Constants.dark_green,
    // padding:2,
    borderRadius: 12,
    backgroundColor: Constants.dark_green,
    alignItems: 'center',
  },
  code: {
    color: Constants.customgrey2,
    // paddingHorizontal: 15,
    fontSize: 16,
    fontFamily:FONTS.Medium,
    marginRight:3,
    // backgroundColor:Constants.white
  },
  pp2: {
    fontSize: 16,
    color: Constants.customgrey,
    // textAlign: 'center',
    fontFamily: FONTS.Regular,
  },
  pp3: {
    fontSize: 16,
    color: Constants.black,
    fontWeight: 'bold',
    // textAlign: 'center',
    fontFamily: FONTS.Bold,
  },
  pp: {
    // alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
    // alignSelf:'center'
  },
  pt: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // justifyContent: 'center',
  },
  logimbtn:{
    color:Constants.white,
    backgroundColor:Constants.dark_green,
    fontSize:16,
    fontFamily:FONTS.SemiBold,
    textAlign:'center',
    paddingVertical:10,
    borderRadius:10,
    // position:'absolute',
    // bottom:20,
    // width:'90%',
    // alignSelf:'center'
  },
  require:{
    color:Constants.red,
    fontFamily:FONTS.Medium,
    marginLeft:10,
    fontSize:14,
    marginTop:10
  },
  ///////////code field//////////
  codeFieldRoot2: {
    width: Dimensions.get('window').width - 40,
    marginTop: -30,
    marginBottom: 10,
  },
  cell: {
    width: 70,
    height: 70,
    lineHeight: 68,
    fontSize: 30,
    fontWeight: '700',
    // fontFamily: 'Helvetica',
    // borderWidth: 2,
    // borderColor: '#fff',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 50,
    color: Constants.dark_green,
    // backgroundColor: Constants.customgrey,
    borderColor: Constants.customgrey,
    borderWidth: 1,
    // shadowColor: Constants.light_black,
  },
  shadopro: {
    shadowOffset: {width: -2, height: 2},
    // shadowOpacity: 0.8,
    // shadowRadius:1,
    elevation: 10,
    shadowColor: Constants.black,
    // shadowColor: '#e8e8e8',
  },
  focusCell: {
    borderColor: Constants.dark_green,
  },

  /////end here///////////
    inpucov: {
    borderColor: Constants.customgrey,
    borderWidth:1,
    // marginVertical: 10,
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 10,
    flexDirection: 'row',
    // justifyContent:'center',
    alignItems: 'center',
    marginHorizontal:20
  },
    inputfield2: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Regular,
    flex: 1,
  },

  ////toggle button
btnCov: {
  height: 50,
  flexDirection: 'row',
  backgroundColor: Constants.customgrey5,
  borderRadius: 12,
  marginVertical: 15,
  marginHorizontal: 20,
  overflow: 'hidden',
  position: 'relative',
},
slider: {
  position: 'absolute',
  width: '50%',
  height: '100%',
  backgroundColor: Constants.dark_green,
  borderRadius: 10,
  zIndex: 0,
},
cencelBtn: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
},
cencelBtn2: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
},
btntxt: {
  fontSize: 16,
  fontWeight: '500',
},
activeText: {
  color: Constants.white,
},
inactiveText: {
  color: Constants.customgrey,
},
/////
  jobtitle: {
      color: Constants.black,
      fontSize: 14,
      fontFamily: FONTS.Medium,
      marginTop:10,
      marginBottom:5,
      marginLeft:20
    },
      langView: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderColor: Constants.white,
    position: 'absolute',
    top: 10,
    right: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap:5,
    zIndex:10
  },
  lang: {
    color: Constants.white,
    fontSize: 16,
    fontFamily:FONTS.Medium,
  },
});

export default styles;
