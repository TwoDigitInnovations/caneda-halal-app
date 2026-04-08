/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import {View, Text} from 'react-native';
import React, {useState, useEffect} from 'react';
import Constants, { FONTS } from '../Helpers/constant';
import moment from 'moment';

const CountDownTime = props => {
  const [timer, setTimer] = useState(20);
  const [getTimer, setGetTimer] = useState({
    day: '00',
    hour: '00',
    min: '00',
    sec: '00',
  });
  const [newInterval, setNewInterVal] = useState();

  useEffect(() => {
    // if (props.startDate) {
    //   count();
    // } else {
    //   clearInterval(newInterval);
    // }
    var x = setInterval(() => {
      var countDownDate = new Date(props.startDate).getTime();
      var now = new Date().getTime();
      var distance = countDownDate -now;
      // console.log('distace',distance)
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setGetTimer({
        day: days,
        hour: hours,
        min: minutes,
        sec: seconds,
      });
      props?.checkValue(false);
      setNewInterVal(x);
      if (distance < 0) {
        props?.checkValue(true);
        clearInterval(x);
        // setGetTimer({
        //   day: '00',
        //   hour: '00',
        //   min: '00',
        //   sec: '00',
        // });
        if (props?.startNow !== undefined) {
          props?.startNow(props);
        }
      }
    }, 1000);
    return () => {
      clearInterval(x);
    };
  }, []);

  // const count = () => {
  //   var x = setInterval(() => {
  //     var countDownDate = new Date(
  //       props.show ? props.startDate : props.endDate,
  //     ).getTime();
  //     var now = new Date().getTime();
  //     var distance = countDownDate - now;
  //     var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  //     var hours = Math.floor(
  //       (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  //     );
  //     var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  //     var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  //     setGetTimer({
  //       day: days,
  //       hour: hours,
  //       min: minutes,
  //       sec: seconds,
  //     });
  //     props?.checkValue(false);
  //     setNewInterVal(x);
  //     if (distance < 0) {
  //       props?.checkValue(true);
  //       clearInterval(x);
  //       setGetTimer({
  //         day: '00',
  //         hour: '00',
  //         min: '00',
  //         sec: '00',
  //       });
  //       if (props?.startNow !== undefined) {
  //         props?.startNow(props);
  //       }
  //     }
  //   }, 1000);
  // };

  let formattedNumber = myNumber => {
    return ('0' + myNumber).slice(-2);
  };

  return (
      <View style={{flex:1}}>
        {/* {getTimer.day > 1 ? (
          <Text
            style={{
              color: props?.color || Constants.black,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 'bold',
            }}>
            {`${formattedNumber(getTimer.day)} Days`}
          </Text>
        ) : ( */}
          <Text
            style={{
              color:Constants.white,
              textAlign: 'center',
              alignSelf:'center',
              fontSize: 16,
              // fontWeight: 'bold',
              flex:1,
              marginLeft:-20,
              marginTop:-5,
              fontFamily:FONTS.SemiBold
              // backgroundColor:Constants.red
            }}>
              {/* ${formattedNumber(getTimer.hour)}H :  */}
            {`
            ${formattedNumber(
              getTimer.min,
            )}M : ${formattedNumber(getTimer.sec)}S`}
          </Text>
        {/* )} */}
      </View>
  );
};

export default CountDownTime;
