import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { useNavigation, useTheme } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { Checkbox, List } from 'react-native-paper';
import ButtonOutline from '../../components/Button/ButtonOutline';
import Button from '../../components/Button/Button';

const Data = [
  {
    id: "1",
    title: "Maruti Suzuki"
  },
  {
    id: "1",
    title: "Budget: 0 - 99,999"
  },
  {
    id: "1",
    title: "Maruti Suzuki"
  },
  {
    id: "1",
    title: "Budget: 0 - 99,999"
  }
];



const FilterOptionData = ["Brand", "Budget", "Year", "No. of Owners", "Km Driven", "Fuel", "Transmission", "Verification"];


const BrandFilterData = [
  {
    selected: false,
    title: "Audi",
  },
  {
    selected: false,
    title: "Bajaj",
  },
  {
    selected: false,
    title: "Bentley",
  },
  {
    selected: false,
    title: "BMW",
  },
  {
    selected: false,
    title: "Bugatti",
  },
  {
    selected: false,
    title: "Ferrari",
  },
  {
    selected: false,
    title: "Ford",
  },
  {
    selected: false,
    title: "Donda",
  },
  {
    selected: false,
    title: "Hindustan",
  },
  {
    selected: false,
    title: "Hindustan Motors",
  },
  {
    selected: false,
    title: "Honda",
  },
  {
    selected: false,
    title: "Hummer",
  }
];
const BudgetFilterData = [
  {
    selected: false,
    title: "Below 1 Lac",
  },
  {
    selected: false,
    title: "1 Lac - 2 Lac",
  },
  {
    selected: false,
    title: "2 Lac - 3 Lac",
  },
  {
    selected: false,
    title: "3 Lac - 5 Lac",
  },
  {
    selected: false,
    title: "5 Lac and Above",
  },
]
const YearFilterData = [
  {
    selected: false,
    title: "Under 3 Years",
  },
  {
    selected: false,
    title: "Under 5 Years",
  },
  {
    selected: false,
    title: "Under 7 Years",
  },
  {
    selected: false,
    title: "7 Years and Above",
  },
]
const NoOwnersFilterData = [
  {
    selected: false,
    title: "Frist",
  },
  {
    selected: false,
    title: "Second",
  },
  {
    selected: false,
    title: "Thrid",
  },
  {
    selected: false,
    title: "Fourth",
  },
  {
    selected: false,
    title: "More than Four",
  },
];
const KmDrivenFilterData = [
  {
    selected: false,
    title: "Below 25000 Km",
  },
  {
    selected: false,
    title: "25000 Km - 50000 Km",
  },
  {
    selected: false,
    title: "50000 Km - 75000 Km",
  },
  {
    selected: false,
    title: "75000 Km - 1000000 Km",
  },
  {
    selected: false,
    title: "1000000 Km and Above",
  },
]
const FuelFilterData = [
  {
    selected: false,
    title: "Petrol",
  },
  {
    selected: false,
    title: "Diesel",
  }, {
    selected: false,
    title: "LPG",
  },
  {
    selected: false,
    title: "CNG & Hybrids",
  },
  {
    selected: false,
    title: "Electric",
  },
]
const TransmissionFilterData = [
  {
    selected: false,
    title: "Automatic",
  },
  {
    selected: false,
    title: "Manual",
  },
]
const VerificationFilterData = [
  {
    selected: false,
    title: "Verified Sellers Only",
  },

]


const FilterSheet = (props, ref) => {

  // ref
  const bottomSheetRef = useRef(null);


  // variables
  const snapPoints = useMemo(() => ['85%'], []);


  // callbacks
  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);



  // renders
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
  );



  useImperativeHandle(ref, () => ({
    // methods connected to `ref`
    openSheet: () => { openSheet() }
  }))
  // internal method
  const openSheet = () => {
    bottomSheetRef.current.snapToIndex(0)
  }

  const theme = useTheme();
  const { colors } = theme;

  const sheetRef = useRef();


  const [show, setshow] = React.useState(true);

  const navigation = useNavigation();

  const handleClosePress = () => {
    bottomSheetRef.current.close()
  }


  const [activeFilter, setActiveFilter] = useState('Brand');
  const [BrandFilter, setBrandFilter] = useState(BrandFilterData);
  const [BudgetFilter, setBudgetFilter] = useState(BudgetFilterData);
  const [YearFilter, setYearFilter] = useState(YearFilterData);
  const [NoOwnersFilter, setNoOwnersFilter] = useState(NoOwnersFilterData);
  const [KmDrivenFilter, setKmDrivenFilter] = useState(KmDrivenFilterData);
  const [FuelFilter, setFuelFilter] = useState(FuelFilterData);
  const [TransmissionFilter, setTransmissionFilter] = useState(TransmissionFilterData);
  const [VerificationFilter, setVerificationFilter] = useState(VerificationFilterData);
  const [filterData, setFilterData] = useState(BrandFilter);

  const handleFilterOption = (val) => {
    setActiveFilter(val);
    setFilterData(
      val == "Brand" ? BrandFilter :
        val == "Budget" ? BudgetFilter :
          val == "Year" ? YearFilter :
            val == "No. of Owners" ? NoOwnersFilter :
              val == "Km Driven" ? KmDrivenFilter :
                val == "Fuel" ? FuelFilter :
                  val == "Transmission" ? TransmissionFilter :
                    val == "Verification" ? VerificationFilter :
                      []
    )
  }

  const handleFilterSelected = (val) => {
    let Brand = BrandFilter.map((data) => {
      if (val === data.title) {
        return { ...data, selected: !data.selected };
      }
      return data;
    });
    let Budget = BudgetFilter.map((data) => {
      if (val === data.title) {
        return { ...data, selected: !data.selected };
      }
      return data;
    });
    let Year = YearFilter.map((data) => {
      if (val === data.title) {
        return { ...data, selected: !data.selected };
      }
      return data;
    });
    let NoOwners = NoOwnersFilter.map((data) => {
      if (val === data.title) {
        return { ...data, selected: !data.selected };
      }
      return data;
    });
    let KmDriven = KmDrivenFilter.map((data) => {
      if (val === data.title) {
        return { ...data, selected: !data.selected };
      }
      return data;
    });
    let Fuel = FuelFilter.map((data) => {
      if (val === data.title) {
        return { ...data, selected: !data.selected };
      }
      return data;
    });
    let Transmission = TransmissionFilter.map((data) => {
      if (val === data.title) {
        return { ...data, selected: !data.selected };
      }
      return data;
    });
    let Verification = VerificationFilter.map((data) => {
      if (val === data.title) {
        return { ...data, selected: !data.selected };
      }
      return data;
    });
    setBrandFilter(Brand);
    setBudgetFilter(Budget);
    setYearFilter(Year);
    setNoOwnersFilter(NoOwners);
    setKmDrivenFilter(KmDriven);
    setFuelFilter(Fuel);
    setTransmissionFilter(Transmission);
    setVerificationFilter(Verification);
    setFilterData(
      activeFilter == "Brand" ? Brand :
        activeFilter == "Budget" ? Budget :
          activeFilter == "Year" ? Year :
            activeFilter == "No. of Owners" ? NoOwners :
              activeFilter == "Km Driven" ? KmDriven :
                activeFilter == "Fuel" ? Fuel :
                  activeFilter == "Transmission" ? Transmission :
                    activeFilter == "Verification" ? Verification :
                      []
    )
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enablePanDownToClose={true}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleStyle={{ top: 0 }}
      handleIndicatorStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.30)', width: 92 }}
      backgroundStyle={{ backgroundColor: colors.card,width:'100%' }}
    >
      <BottomSheetScrollView>
        <View style={[GlobalStyleSheet.container, { padding:0,margin:0 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[FONTS.h4, FONTS.fontMedium, { color: colors.title }]}>Filter</Text>
            <TouchableOpacity
              onPress={() => handleClosePress()}
            >
              <Image
                style={{ width: 16, height: 16, resizeMode: 'contain', tintColor: colors.title }}
                source={IMAGES.close}
              />
            </TouchableOpacity>
          </View>
          <View style={[GlobalStyleSheet.container, {
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }]}>
            <ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal
              contentContainerStyle={{marginHorizontal:0}}
            >
              {Data.map((data, index) => {
                return (
                  <View key={index}
                    style={{
                      backgroundColor: 'rgba(110, 78, 212, 0.10)',
                      borderRadius: 20,
                      paddingVertical: 5,
                      paddingHorizontal: 15,
                      marginRight: 10
                    }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}>
                      <Text style={[FONTS.fontSm, { color: colors.title }]}>{data.title}</Text>
                      <TouchableOpacity>
                        <Image
                          style={{ width: 10, height: 10, resizeMode: 'contain', tintColor: colors.title }}
                          source={IMAGES.close}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              })}
            </ScrollView>
          </View>
        </View>
        <View style={[GlobalStyleSheet.container,{
          flex: 1,
          flexDirection: 'row',
          marginTop: -14,
          padding:0,
          margin:0
        }]}>
          <View
            style={{
              width: 140,
              backgroundColor: 'rgba(110, 78, 212, 0.16)'
            }}
          >
            <ScrollView contentContainerStyle={{ paddingBottom: 150 }} showsHorizontalScrollIndicator={false}>
              {FilterOptionData.map((data, index) => (
                <List.Item
                  style={[
                    data == activeFilter && {
                      backgroundColor: colors.card,

                    },
                    {

                      borderBottomWidth: 1,
                      borderBottomColor: colors.border
                    }
                  ]}
                  onPress={() => handleFilterOption(data)}
                  key={index}
                  title={() => <Text style={{ ...FONTS.font, ...FONTS.fontTitle, color: colors.title }}>{data}</Text>}
                />
              ))}
            </ScrollView>
          </View>
          <View
            style={{
              flex: 1,
            }}
          >
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
              <View>
                <TextInput
                  style={{ borderWidth: 1, borderColor: colors.borderColor, paddingLeft: 10, borderRadius: 6, margin: 10, height: 42, paddingRight: 35, marginBottom: 0 }}
                  placeholder='Search brand...'
                  placeholderTextColor={theme.dark ? 'rgba(255,255,255,.6)' : 'rgba(18,9,46,.50)'}
                />
                <View style={{ position: 'absolute', right: 25, top: 20 }}>
                  <Image
                    style={{ width: 18, height: 18, resizeMode: 'contain', tintColor: colors.title }}
                    source={IMAGES.search}
                  />
                </View>
              </View>
              {filterData.map((data, index) => {
                return (

                  <Checkbox.Item
                    key={index}
                    onPress={() => handleFilterSelected(data.title)}
                    position='leading'
                    label={data.title}
                    labelStyle={{
                      ...FONTS.font,
                      fontSize: 15,
                      color: colors.title,
                      textAlign: 'left',
                      width: '100%'
                    }}
                    uncheckedColor={colors.textLight}
                    color={COLORS.primary}
                    status={data.selected ? 'checked' : 'unchecked'}
                  />
                )
              })}
            </ScrollView>
          </View>
        </View>
        <View style={[GlobalStyleSheet.container, [props.height === false ? { marginBottom: 20 } : { marginBottom: 70 }]]}>
          <View style={{
            flexDirection: 'row', justifyContent: 'center', gap: 10
          }}>
            <View style={{ flex: 1 }}>
              <ButtonOutline
                title="Clear all"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Apply"
              />
            </View>
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default forwardRef(FilterSheet);
