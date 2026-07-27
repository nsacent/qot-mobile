import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS } from '../constants/theme';

const CATEGORY_VISUALS = {
    all: { icon: 'grid', color: COLORS.primary },
    vehicles: { icon: 'truck', color: COLORS.primary },
    'cars-vehicles': { icon: 'truck', color: COLORS.primary },
    'phones-tablets': { icon: 'smartphone', color: COLORS.info },
    property: { icon: 'home', color: '#7C3AED' },
    jobs: { icon: 'briefcase', color: '#0F766E' },
    agriculture: { icon: 'feather', color: COLORS.success },
    electronics: { icon: 'monitor', color: '#0891B2' },
    furniture: { icon: 'box', color: '#B45309' },
    'home-furniture': { icon: 'home', color: '#B45309' },
    'home-garden': { icon: 'home', color: '#B45309' },
    fashion: { icon: 'shopping-bag', color: '#DB2777' },
    pets: { icon: 'heart', color: '#D97706' },
    'sports-hobbies': { icon: 'target', color: '#4F46E5' },
    services: { icon: 'tool', color: '#0284C7' },
    'health-beauty': { icon: 'activity', color: '#E11D48' },
    'baby-kids': { icon: 'smile', color: '#C2410C' },
};

const CATEGORY_PATTERNS = [
    [/(mobile|phone|tablet)/, { icon: 'smartphone', color: '#2563EB' }],
    [/(laptop|computer|it-job)/, { icon: 'monitor', color: '#0891B2' }],
    [/(tv|gaming|console)/, { icon: 'play-circle', color: '#7C3AED' }],
    [/(camera|photography|video)/, { icon: 'camera', color: '#DB2777' }],
    [/(audio|speaker|musical|instrument)/, { icon: 'music', color: '#4F46E5' }],
    [/(printer|printing|scanner)/, { icon: 'printer', color: '#0F766E' }],
    [/(watch)/, { icon: 'clock', color: '#D97706' }],
    [/(car|truck|bus|driver|transport|heavy-equipment)/, { icon: 'truck', color: '#EA580C' }],
    [/(motorcycle|bicycle)/, { icon: 'navigation', color: '#F97316' }],
    [/(tyre|wheel|part)/, { icon: 'settings', color: '#475569' }],
    [/(boat)/, { icon: 'anchor', color: '#0284C7' }],
    [/(house|apartment|hostel|rental|property)/, { icon: 'home', color: '#7C3AED' }],
    [/(land)/, { icon: 'map', color: '#16A34A' }],
    [/(shop|office|business)/, { icon: 'briefcase', color: '#0F766E' }],
    [/(clothing|clothes|uniform|wedding|wear)/, { icon: 'user', color: '#DB2777' }],
    [/(shoe)/, { icon: 'navigation', color: '#E11D48' }],
    [/(bag)/, { icon: 'shopping-bag', color: '#B45309' }],
    [/(jewellery|accessories)/, { icon: 'star', color: '#CA8A04' }],
    [/(sofa|bed|mattress|wardrobe|furniture)/, { icon: 'box', color: '#B45309' }],
    [/(table|chair)/, { icon: 'columns', color: '#A16207' }],
    [/(kitchen|hotel|restaurant)/, { icon: 'coffee', color: '#C2410C' }],
    [/(decor|art|craft|graphic-design)/, { icon: 'image', color: '#9333EA' }],
    [/(lighting)/, { icon: 'sun', color: '#EAB308' }],
    [/(appliance)/, { icon: 'cpu', color: '#0891B2' }],
    [/(accounting|finance)/, { icon: 'dollar-sign', color: '#15803D' }],
    [/(sales|marketing)/, { icon: 'trending-up', color: '#EA580C' }],
    [/(teaching|school|book)/, { icon: 'book-open', color: '#4F46E5' }],
    [/(security|legal)/, { icon: 'shield', color: '#475569' }],
    [/(part-time|short-stay)/, { icon: 'clock', color: '#0284C7' }],
    [/(repair|service|construction|tool)/, { icon: 'tool', color: '#0284C7' }],
    [/(cleaning)/, { icon: 'droplet', color: '#0891B2' }],
    [/(event)/, { icon: 'calendar', color: '#7C3AED' }],
    [/(farm|agricultural|seed|fertilizer|produce|animal-feed)/, { icon: 'feather', color: '#16A34A' }],
    [/(poultry|bird)/, { icon: 'feather', color: '#D97706' }],
    [/(skin|hair|makeup|perfume|beauty|salon|personal-care)/, { icon: 'heart', color: '#E11D48' }],
    [/(fitness|gym|sport)/, { icon: 'activity', color: '#4F46E5' }],
    [/(baby|kid|toy)/, { icon: 'smile', color: '#C2410C' }],
    [/(dog|cat|pet|veterinary)/, { icon: 'heart', color: '#D97706' }],
];

export const categoryVisual = (slug = '') => {
    const normalizedSlug = String(slug).toLowerCase();
    return CATEGORY_VISUALS[normalizedSlug]
        || CATEGORY_PATTERNS.find(([pattern]) => pattern.test(normalizedSlug))?.[1]
        || { icon: 'grid', color: COLORS.primary };
};

const CategoryIcon = ({
    slug,
    selected = false,
    size = 30,
    containerSize = 54,
    borderRadius = 17,
}) => {
    const { colors, dark } = useTheme();
    const visual = categoryVisual(slug);
    const accent = selected ? COLORS.primary : visual.color;

    return (
        <View
            style={{
                height: containerSize,
                width: containerSize,
                borderRadius,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: selected
                    ? COLORS.primary
                    : dark ? `${visual.color}66` : `${visual.color}35`,
                backgroundColor: selected
                    ? dark ? `${COLORS.primary}2E` : `${COLORS.primary}14`
                    : dark ? `${visual.color}24` : `${visual.color}12`,
                shadowColor: dark ? '#000000' : visual.color,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: dark ? 0.16 : 0.08,
                shadowRadius: 4,
                elevation: dark ? 0 : 1,
            }}
        >
            <View
                style={{
                    height: Math.round(containerSize * 0.64),
                    width: Math.round(containerSize * 0.64),
                    borderRadius: Math.round(containerSize * 0.22),
                    backgroundColor: dark ? colors.card : 'rgba(255,255,255,.74)',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <FeatherIcon name={visual.icon} size={size} color={accent} />
            </View>
        </View>
    );
};

export default React.memo(CategoryIcon);
