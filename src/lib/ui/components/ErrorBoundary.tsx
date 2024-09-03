import { Strings } from "@core/i18n";
import { Nullish } from "@lib/utils/types";
import { React } from "@metro/common";
import { Button, LegacyFormText } from "@metro/common/components";
import { Codeblock } from "@ui/components";
import { createLegacyClassComponentStyles, ThemeContext } from "@ui/styles";
import { ScrollView } from "react-native";

type ErrorBoundaryState = {
    hasErr: false;
} | {
    hasErr: true;
    error: Error;
};

export interface ErrorBoundaryProps {
    children: JSX.Element | Nullish | (JSX.Element | Nullish)[];
}

const getStyles = createLegacyClassComponentStyles({
    view: {
        flex: 1,
        flexDirection: "column",
        margin: 10,
    },
    title: {
        fontSize: 20,
        textAlign: "center",
        marginBottom: 5,
    },
});

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasErr: false };
    }

    static contextType = ThemeContext;
    static getDerivedStateFromError = (error: Error) => ({ hasErr: true, error });

    render() {
        const styles = getStyles(this.context);
        if (!this.state.hasErr) return this.props.children;

        return (
            <ScrollView style={styles.view}>
                <LegacyFormText style={styles.title}>{Strings.UH_OH}</LegacyFormText>
                <Codeblock selectable style={{ marginBottom: 5 }}>{this.state.error.name}</Codeblock>
                <Codeblock selectable style={{ marginBottom: 5 }}>{this.state.error.message}</Codeblock>
                {this.state.error.stack && <ScrollView style={{ maxHeight: 420, marginBottom: 5 }}>
                    <Codeblock selectable>{this.state.error.stack}</Codeblock>
                </ScrollView>}
                <Button
                    size="md"
                    variant="destructive"
                    onPress={() => this.setState({ hasErr: false })}
                    text={Strings.RETRY}
                />
            </ScrollView>
        );
    }
}
