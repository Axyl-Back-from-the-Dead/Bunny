import { formatString, Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import ThemeCard from "@core/ui/settings/pages/Themes/ThemeCard";
import { settings } from "@lib/api/settings";
import { useProxy } from "@lib/api/storage";
import { installTheme, Theme, themes } from "@lib/themes";
import { Author } from "@lib/utils/types";
import { Button } from "@metro/common/components";

export default function Themes() {
    useProxy(settings);
    useProxy(themes);

    return (
        <AddonPage<Theme>
            title={Strings.THEMES}
            searchKeywords={[
                "data.name",
                "data.description",
                p => p.data.authors?.map((a: Author) => a.name).join(", ") ?? "unknown"
            ]}
            sortOptions={{
                "Name (A-Z)": (a, b) => a.data.name.localeCompare(b.data.name),
                "Name (Z-A)": (a, b) => b.data.name.localeCompare(a.data.name)
            }}
            installAction={{
                label: "Install a theme",
                fetchFn: installTheme
            }}
            items={Object.values(themes)}
            safeModeHint={{
                message: formatString("SAFE_MODE_NOTICE_THEMES", { enabled: Boolean(settings.safeMode?.currentThemeId) }),
                footer: settings.safeMode?.currentThemeId && <Button
                    size="small"
                    text={Strings.DISABLE_THEME}
                    onPress={() => delete settings.safeMode?.currentThemeId}
                    style={{ marginTop: 8 }}
                />
            }}
            CardComponent={ThemeCard}
        />
    );
}
