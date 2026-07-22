import React, { useMemo, useState } from 'react';
import {
    Modal,
    SafeAreaView,
    SectionList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS } from '../constants/theme';

const MarketplaceSelectionModal = ({
    visible,
    title,
    groups = [],
    selectedId,
    onSelect,
    onClose,
    searchPlaceholder = 'Search...',
}) => {
    const { colors } = useTheme();
    const [query, setQuery] = useState('');

    const sections = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return groups.map((group) => ({ title: group.title, data: group.items || [] }));

        return groups
            .map((group) => {
                const groupMatches = group.title.toLowerCase().includes(normalizedQuery);
                const items = groupMatches
                    ? (group.items || [])
                    : (group.items || []).filter((item) => item.name.toLowerCase().includes(normalizedQuery));
                return { title: group.title, data: items };
            })
            .filter((section) => section.data.length);
    }, [groups, query]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
            onShow={() => setQuery('')}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.borderColor }}>
                    <Text style={[FONTS.h5, { color: colors.title, flex: 1 }] }>{title}</Text>
                    <TouchableOpacity onPress={onClose} style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <FeatherIcon name="x" size={24} color={colors.title} />
                    </TouchableOpacity>
                </View>

                <View style={{ padding: 15 }}>
                    <View style={{ justifyContent: 'center' }}>
                        <FeatherIcon name="search" size={18} color={colors.text} style={{ position: 'absolute', left: 14, zIndex: 1 }} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder={searchPlaceholder}
                            placeholderTextColor={colors.textLight}
                            autoCorrect={false}
                            style={{ height: 48, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 12, paddingLeft: 43, paddingRight: 15, color: colors.title, backgroundColor: colors.card }}
                        />
                    </View>
                </View>

                <SectionList
                    sections={sections}
                    keyExtractor={(item) => String(item.id)}
                    keyboardShouldPersistTaps="handled"
                    stickySectionHeadersEnabled
                    contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}
                    renderSectionHeader={({ section }) => (
                        <View style={{ backgroundColor: colors.background, paddingHorizontal: 16, paddingVertical: 9 }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }] }>{section.title}</Text>
                        </View>
                    )}
                    renderItem={({ item }) => {
                        const selected = String(item.id) === String(selectedId);
                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                                style={{ flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: selected ? `${COLORS.primary}10` : colors.card }}
                            >
                                <Text style={[FONTS.font, { color: selected ? COLORS.primary : colors.title, flex: 1 }] }>{item.name}</Text>
                                {selected && <FeatherIcon name="check" size={19} color={COLORS.primary} />}
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={(
                        <Text style={[FONTS.font, { color: colors.text, textAlign: 'center', padding: 30 }]}>No matches found.</Text>
                    )}
                />
            </SafeAreaView>
        </Modal>
    );
};

export default MarketplaceSelectionModal;
