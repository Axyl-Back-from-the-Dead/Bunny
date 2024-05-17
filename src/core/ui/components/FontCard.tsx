import { Strings } from "@core/i18n";
import { CardWrapper } from "@core/ui/components/Card";
import { getAssetIDByName } from "@lib/api/assets";
import { useProxy } from "@lib/api/storage";
import { FontDefinition, fonts, removeFont, selectFont } from "@lib/managers/fonts";
import { FormCheckbox, IconButton, TableRow, TableRowGroup } from "@lib/ui/components/discord/Redesign";
import { showToast } from "@lib/ui/toasts";
import { useContext } from "react";
import { Pressable, View } from "react-native";

import { RemoveModeContext } from "./AddonPage";

export default function FontCard({ item: font, index }: CardWrapper<FontDefinition>) {
    useProxy(fonts);

    const removeMode = useContext(RemoveModeContext);
    const selected = fonts.__selected === font.name;

    return <View key={index} style={{ marginVertical: 4 }}>
        <TableRowGroup>
            <TableRow
                label={font.name}
                subLabel={font.previewText ?? "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups."}
                trailing={
                    <Pressable onPress={() => {
                        selectFont(selected ? null : font.name).then(() => {
                            showToast(Strings.RESTART_REQUIRED_TO_TAKE_EFFECT, getAssetIDByName("WarningIcon"));
                        });
                    }}>
                        {!removeMode ? <FormCheckbox checked={selected} /> : <IconButton
                            size="sm"
                            variant="secondary"
                            icon={getAssetIDByName("TrashIcon")}
                            onPress={() => removeFont(font.name)}
                        />}
                    </Pressable>
                }
            />
        </TableRowGroup>
    </View>;
}
