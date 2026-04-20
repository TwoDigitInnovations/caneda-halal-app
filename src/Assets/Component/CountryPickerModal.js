import React, {useState, useMemo} from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Constants, {FONTS} from '../Helpers/constant';

// Emoji flag from 2-letter country code
const getFlagEmoji = code => {
  if (!code || code.length !== 2) return '🌐';
  const points = [...code.toUpperCase()].map(
    c => 0x1f1e6 + c.charCodeAt(0) - 65,
  );
  return String.fromCodePoint(...points);
};

// Country data: [cca2, name, callingCode]
const COUNTRIES = [
  ['AD', 'Andorra', '376'],
  ['AE', 'United Arab Emirates', '971'],
  ['AF', 'Afghanistan', '93'],
  ['AG', 'Antigua and Barbuda', '1'],
  ['AL', 'Albania', '355'],
  ['AM', 'Armenia', '374'],
  ['AO', 'Angola', '244'],
  ['AR', 'Argentina', '54'],
  ['AT', 'Austria', '43'],
  ['AU', 'Australia', '61'],
  ['AZ', 'Azerbaijan', '994'],
  ['BA', 'Bosnia and Herzegovina', '387'],
  ['BB', 'Barbados', '1'],
  ['BD', 'Bangladesh', '880'],
  ['BE', 'Belgium', '32'],
  ['BF', 'Burkina Faso', '226'],
  ['BG', 'Bulgaria', '359'],
  ['BH', 'Bahrain', '973'],
  ['BI', 'Burundi', '257'],
  ['BJ', 'Benin', '229'],
  ['BN', 'Brunei', '673'],
  ['BO', 'Bolivia', '591'],
  ['BR', 'Brazil', '55'],
  ['BS', 'Bahamas', '1'],
  ['BT', 'Bhutan', '975'],
  ['BW', 'Botswana', '267'],
  ['BY', 'Belarus', '375'],
  ['BZ', 'Belize', '501'],
  ['CA', 'Canada', '1'],
  ['CD', 'DR Congo', '243'],
  ['CF', 'Central African Republic', '236'],
  ['CG', 'Republic of the Congo', '242'],
  ['CH', 'Switzerland', '41'],
  ['CI', "Côte d'Ivoire", '225'],
  ['CL', 'Chile', '56'],
  ['CM', 'Cameroon', '237'],
  ['CN', 'China', '86'],
  ['CO', 'Colombia', '57'],
  ['CR', 'Costa Rica', '506'],
  ['CU', 'Cuba', '53'],
  ['CV', 'Cape Verde', '238'],
  ['CY', 'Cyprus', '357'],
  ['CZ', 'Czech Republic', '420'],
  ['DE', 'Germany', '49'],
  ['DJ', 'Djibouti', '253'],
  ['DK', 'Denmark', '45'],
  ['DM', 'Dominica', '1'],
  ['DO', 'Dominican Republic', '1'],
  ['DZ', 'Algeria', '213'],
  ['EC', 'Ecuador', '593'],
  ['EE', 'Estonia', '372'],
  ['EG', 'Egypt', '20'],
  ['ER', 'Eritrea', '291'],
  ['ES', 'Spain', '34'],
  ['ET', 'Ethiopia', '251'],
  ['FI', 'Finland', '358'],
  ['FJ', 'Fiji', '679'],
  ['FR', 'France', '33'],
  ['GA', 'Gabon', '241'],
  ['GB', 'United Kingdom', '44'],
  ['GD', 'Grenada', '1'],
  ['GE', 'Georgia', '995'],
  ['GH', 'Ghana', '233'],
  ['GM', 'Gambia', '220'],
  ['GN', 'Guinea', '224'],
  ['GQ', 'Equatorial Guinea', '240'],
  ['GR', 'Greece', '30'],
  ['GT', 'Guatemala', '502'],
  ['GW', 'Guinea-Bissau', '245'],
  ['GY', 'Guyana', '592'],
  ['HN', 'Honduras', '504'],
  ['HR', 'Croatia', '385'],
  ['HT', 'Haiti', '509'],
  ['HU', 'Hungary', '36'],
  ['ID', 'Indonesia', '62'],
  ['IE', 'Ireland', '353'],
  ['IL', 'Israel', '972'],
  ['IN', 'India', '91'],
  ['IQ', 'Iraq', '964'],
  ['IR', 'Iran', '98'],
  ['IS', 'Iceland', '354'],
  ['IT', 'Italy', '39'],
  ['JM', 'Jamaica', '1'],
  ['JO', 'Jordan', '962'],
  ['JP', 'Japan', '81'],
  ['KE', 'Kenya', '254'],
  ['KG', 'Kyrgyzstan', '996'],
  ['KH', 'Cambodia', '855'],
  ['KI', 'Kiribati', '686'],
  ['KM', 'Comoros', '269'],
  ['KN', 'Saint Kitts and Nevis', '1'],
  ['KP', 'North Korea', '850'],
  ['KR', 'South Korea', '82'],
  ['KW', 'Kuwait', '965'],
  ['KZ', 'Kazakhstan', '7'],
  ['LA', 'Laos', '856'],
  ['LB', 'Lebanon', '961'],
  ['LC', 'Saint Lucia', '1'],
  ['LI', 'Liechtenstein', '423'],
  ['LK', 'Sri Lanka', '94'],
  ['LR', 'Liberia', '231'],
  ['LS', 'Lesotho', '266'],
  ['LT', 'Lithuania', '370'],
  ['LU', 'Luxembourg', '352'],
  ['LV', 'Latvia', '371'],
  ['LY', 'Libya', '218'],
  ['MA', 'Morocco', '212'],
  ['MC', 'Monaco', '377'],
  ['MD', 'Moldova', '373'],
  ['ME', 'Montenegro', '382'],
  ['MG', 'Madagascar', '261'],
  ['MH', 'Marshall Islands', '692'],
  ['MK', 'North Macedonia', '389'],
  ['ML', 'Mali', '223'],
  ['MM', 'Myanmar', '95'],
  ['MN', 'Mongolia', '976'],
  ['MR', 'Mauritania', '222'],
  ['MT', 'Malta', '356'],
  ['MU', 'Mauritius', '230'],
  ['MV', 'Maldives', '960'],
  ['MW', 'Malawi', '265'],
  ['MX', 'Mexico', '52'],
  ['MY', 'Malaysia', '60'],
  ['MZ', 'Mozambique', '258'],
  ['NA', 'Namibia', '264'],
  ['NE', 'Niger', '227'],
  ['NG', 'Nigeria', '234'],
  ['NI', 'Nicaragua', '505'],
  ['NL', 'Netherlands', '31'],
  ['NO', 'Norway', '47'],
  ['NP', 'Nepal', '977'],
  ['NR', 'Nauru', '674'],
  ['NZ', 'New Zealand', '64'],
  ['OM', 'Oman', '968'],
  ['PA', 'Panama', '507'],
  ['PE', 'Peru', '51'],
  ['PG', 'Papua New Guinea', '675'],
  ['PH', 'Philippines', '63'],
  ['PK', 'Pakistan', '92'],
  ['PL', 'Poland', '48'],
  ['PT', 'Portugal', '351'],
  ['PW', 'Palau', '680'],
  ['PY', 'Paraguay', '595'],
  ['QA', 'Qatar', '974'],
  ['RO', 'Romania', '40'],
  ['RS', 'Serbia', '381'],
  ['RU', 'Russia', '7'],
  ['RW', 'Rwanda', '250'],
  ['SA', 'Saudi Arabia', '966'],
  ['SB', 'Solomon Islands', '677'],
  ['SC', 'Seychelles', '248'],
  ['SD', 'Sudan', '249'],
  ['SE', 'Sweden', '46'],
  ['SG', 'Singapore', '65'],
  ['SI', 'Slovenia', '386'],
  ['SK', 'Slovakia', '421'],
  ['SL', 'Sierra Leone', '232'],
  ['SM', 'San Marino', '378'],
  ['SN', 'Senegal', '221'],
  ['SO', 'Somalia', '252'],
  ['SR', 'Suriname', '597'],
  ['SS', 'South Sudan', '211'],
  ['ST', 'São Tomé and Príncipe', '239'],
  ['SV', 'El Salvador', '503'],
  ['SY', 'Syria', '963'],
  ['SZ', 'Eswatini', '268'],
  ['TD', 'Chad', '235'],
  ['TG', 'Togo', '228'],
  ['TH', 'Thailand', '66'],
  ['TJ', 'Tajikistan', '992'],
  ['TL', 'Timor-Leste', '670'],
  ['TM', 'Turkmenistan', '993'],
  ['TN', 'Tunisia', '216'],
  ['TO', 'Tonga', '676'],
  ['TR', 'Turkey', '90'],
  ['TT', 'Trinidad and Tobago', '1'],
  ['TV', 'Tuvalu', '688'],
  ['TZ', 'Tanzania', '255'],
  ['UA', 'Ukraine', '380'],
  ['UG', 'Uganda', '256'],
  ['US', 'United States', '1'],
  ['UY', 'Uruguay', '598'],
  ['UZ', 'Uzbekistan', '998'],
  ['VA', 'Vatican City', '39'],
  ['VC', 'Saint Vincent and the Grenadines', '1'],
  ['VE', 'Venezuela', '58'],
  ['VN', 'Vietnam', '84'],
  ['VU', 'Vanuatu', '678'],
  ['WS', 'Samoa', '685'],
  ['YE', 'Yemen', '967'],
  ['ZA', 'South Africa', '27'],
  ['ZM', 'Zambia', '260'],
  ['ZW', 'Zimbabwe', '263'],
];

/**
 * Drop-in replacement for react-native-country-picker-modal.
 *
 * Props:
 *   countryCode  – selected country cca2 (e.g. 'CA')
 *   visible      – controls modal visibility
 *   withFlag     – show flag emoji (default true)
 *   onClose      – called when modal closes without selection
 *   onSelect     – called with { cca2, callingCode: [code] }
 */
const CountryPickerModal = ({
  countryCode = 'CA',
  visible = false,
  withFlag = true,
  onClose,
  onSelect,
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      ([code, name, dial]) =>
        name.toLowerCase().includes(q) ||
        code.toLowerCase().includes(q) ||
        dial.includes(q),
    );
  }, [search]);

  const handleSelect = item => {
    const [cca2, , callingCode] = item;
    setSearch('');
    onSelect && onSelect({cca2, callingCode: [callingCode]});
  };

  const handleClose = () => {
    setSearch('');
    onClose && onClose();
  };

  const flag = withFlag ? getFlagEmoji(countryCode) : null;

  return (
    <>
      {/* Flag display (shown inline, outside modal) */}
      {flag ? <Text style={styles.flag}>{flag}</Text> : null}

      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={handleClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Country</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.search}
            placeholder="Search country or code..."
            placeholderTextColor={Constants.customgrey2}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />

          <FlatList
            data={filtered}
            keyExtractor={item => item[0]}
            keyboardShouldPersistTaps="handled"
            renderItem={({item}) => {
              const [code, name, dial] = item;
              return (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => handleSelect(item)}>
                  <Text style={styles.rowFlag}>{getFlagEmoji(code)}</Text>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.rowDial}>+{dial}</Text>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  flag: {
    fontSize: 24,
  },
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Constants.customgrey5,
  },
  title: {
    fontSize: 17,
    fontFamily: FONTS.Medium,
    color: Constants.dark_green || Constants.normal_green,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    color: Constants.customgrey3,
  },
  search: {
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Constants.customgrey4,
    fontSize: 15,
    fontFamily: FONTS.Regular || FONTS.Medium,
    color: Constants.black || '#000',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  rowName: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.Regular || FONTS.Medium,
    color: Constants.black || '#000',
  },
  rowDial: {
    fontSize: 14,
    color: Constants.customgrey2,
    fontFamily: FONTS.Regular || FONTS.Medium,
  },
  separator: {
    height: 1,
    backgroundColor: Constants.customgrey4,
    marginLeft: 52,
  },
});

export default CountryPickerModal;
