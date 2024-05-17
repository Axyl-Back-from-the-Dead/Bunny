import { find, findByProps } from "@lib/metro";
import { RedesignModuleKeys } from "@lib/ui/types";
import { useEffect } from "react";
import { View } from "react-native";

const findSingular = (prop: string) => find(m => m[prop] && Object.keys(m).length === 1)?.[prop];

export const Redesign = findByProps("TableRow") as Record<RedesignModuleKeys, any>;

export const CompatfulRedesign = findByProps("ActionSheetRow") as unknown as {
    TextStyleSheet: typeof import("@ui/styles").TextStyleSheet;
    [key: string]: any;
};

// Funny polyfill, hopefully same props :3
CompatfulRedesign.ActionSheetTitleHeader ??= CompatfulRedesign.BottomSheetTitleHeader;
CompatfulRedesign.ActionSheetContentContainer ??= ({ children }: any) => {
    useEffect(() => console.warn("Discord has removed 'ActionSheetContentContainer', please move into something else. It has been temporarily replaced with View"), []);
    return <View>{children}</View>;
};

export const FormSwitch = findSingular("FormSwitch");
export const FormRadio = findSingular("FormRadio");
export const FormCheckbox = findSingular("FormCheckbox");

export const {
    AlertActionButton,
    AlertModal,
    AlertModalContainer,
    AvatarDuoPile,
    AvatarPile,
    Backdrop,
    Button,
    Card,
    ContextMenu,
    ContextMenuContainer,
    FauxHeader,
    FloatingActionButton,
    GhostInput,
    GuildIconPile,
    HeaderActionButton,
    HeaderButton,
    HeaderSubmittingIndicator,
    IconButton,
    Input,
    InputButton,
    InputContainer,
    LayerContext,
    LayerScope,
    Modal,
    ModalActionButton,
    ModalContent,
    ModalDisclaimer,
    ModalFloatingAction,
    ModalFloatingActionSpacer,
    ModalFooter,
    ModalScreen,
    ModalStepIndicator,
    Navigator,
    NavigatorHeader,
    NavigatorScreen,
    Pile,
    PileOverflow,
    RedesignCompat,
    RedesignCompatContext,
    RowButton,
    SceneLoadingIndicator,
    SearchField,
    SegmentedControl,
    SegmentedControlPages,
    Slider,
    Stack,
    StepModal,
    StickyContext,
    StickyHeader,
    StickyWrapper,
    TableCheckboxRow,
    TableRadioGroup,
    TableRadioRow,
    TableRow,
    TableRowGroup,
    TableRowGroupTitle,
    TableRowIcon,
    TableSwitchRow,
    Tabs,
    TextArea,
    TextField,
    TextInput,
    Toast,
    dismissAlerts,
    getHeaderBackButton,
    getHeaderCloseButton,
    getHeaderConditionalBackButton,
    getHeaderNoTitle,
    getHeaderTextButton,
    hideContextMenu,
    navigatorShouldCrossfade,
    openAlert,
    useAccessibilityNativeStackOptions,
    useAndroidNavScrim,
    useCoachmark,
    useFloatingActionButtonScroll,
    useFloatingActionButtonState,
    useNativeStackNavigation,
    useNavigation,
    useNavigationTheme,
    useNavigatorBackPressHandler,
    useNavigatorScreens,
    useNavigatorShouldCrossfade,
    useSegmentedControlState,
    useStackNavigation,
    useTabNavigation,
    useTooltip
} = Redesign;

export const {
    AccessibilityAnnouncer,
    AccessibilityPreferencesContext,
    AccessibilityView,
    AccessibilityViewAnimated,
    ActionSheet,
    ActionSheetCloseButton,
    ActionSheetIconHeader,
    ActionSheetPresenter,
    ActionSheetRow,
    ActionSheetSwitchRow,
    AnimatedEnterExitItem,
    BottomSheetTitleHeader,
    BottomSheetTextInput,
    Dialog,
    DisableCustomTheme,
    Menu,
    MenuGroup,
    MenuItem,
    MenuPopout,
    RootThemeContextProvider,
    SimpleActionSheet,
    Text,
    TextStyleSheet,
    ThemeContextFlags,
    ThemeContextForLegacyStyles,
    ThemeContextProvider,
    TransitionGroup,
    TransitionItem,
    TransitionStates,
    UseThemeContext,
    WCAGContrastRatios,
    createLegacyClassComponentStyles,
    createNativeStyleProperties,
    createStyleProperties,
    createStyles,
    darkenColor,
    experimental_createToken,
    getContrastingColor,
    getSemanticColorContextFromThemeContext,
    hasThemeFlag,
    setColorOpacity,
    setThemeFlag,
    showSimpleActionSheet,
    useLegacyClassComponentStyles,
    useThemeContext,
    useToken
} = CompatfulRedesign;
