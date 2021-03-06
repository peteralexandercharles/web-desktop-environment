import React from "react";
import Component from "@component";
import { ViewsProvider } from "@react-fullstack/fullstack";
import { ViewInterfacesType } from "@web-desktop-environment/interfaces";
import * as apps from "@apps/index";
import { OpenApp } from "@web-desktop-environment/interfaces/lib/views/Desktop";
import {
	ThemeType,
	Theme,
} from "@web-desktop-environment/interfaces/lib/shared/settings";

interface DesktopState {
	background: string;
	nativeBackground: string;
	openApps: OpenApp[];
	theme: ThemeType;
	customTheme: Theme;
}

class Desktop extends Component<{}, DesktopState> {
	name = "desktop";
	state: DesktopState = {
		background: this.desktopManager.settingsManager.settings.desktop.background,
		nativeBackground: this.desktopManager.settingsManager.settings.desktop
			.nativeBackground,
		openApps: this.desktopManager.windowManager.runningApps.map((app) => ({
			icon: app.icon,
			nativeIcon: app.nativeIcon,
			id: app.id,
			name: app.name,
			port: app.port,
		})),
		theme: this.desktopManager.settingsManager.settings.desktop.theme,
		customTheme: this.desktopManager.settingsManager.settings.desktop
			.customTheme,
	};
	componentDidMount = () => {
		const listenToNewSettings = this.desktopManager.settingsManager.emitter.on(
			"onNewSettings",
			(settings) => {
				this.setState({
					background: settings.desktop.background,
					nativeBackground: settings.desktop.nativeBackground,
					customTheme: settings.desktop.customTheme,
					theme: settings.desktop.theme,
				});
			}
		);
		this.onComponentWillUnmount.push(listenToNewSettings.remove);
		this.desktopManager.windowManager.emitter.on("onAppsUpdate", (openApps) => {
			this.setState({
				openApps: openApps.map((app) => ({
					icon: app.icon,
					nativeIcon: app.nativeIcon,
					id: app.id,
					name: app.name,
					port: app.port,
				})),
			});
		});
	};
	launchApp = async (app) => {
		this.logger.info(`launch app flow ${app.flow}`);
		this.desktopManager.windowManager.spawnApp(app.flow, app.params);
	};
	closeApp = async (id) => {
		this.logger.info(
			`closing app flow ${
				this.desktopManager.windowManager.runningApps.find(
					(app) => app.id === id
				).name
			}`
		);
		this.desktopManager.windowManager.killApp(id);
	};
	renderComponent() {
		const appsProp = Object.keys(apps).map((flow) => {
			const { name, description, icon, nativeIcon } = apps[flow];
			return {
				name,
				nativeIcon,
				description,
				icon,
				flow,
			};
		});
		const {
			background,
			nativeBackground,
			openApps,
			customTheme,
			theme,
		} = this.state;
		return (
			<ViewsProvider<ViewInterfacesType>>
				{({ Desktop: DesktopView, ThemeProvider }) => (
					<ThemeProvider theme={theme} customTheme={customTheme}>
						<DesktopView
							apps={appsProp}
							openApps={openApps}
							background={background}
							nativeBackground={nativeBackground}
							onCloseApp={this.closeApp}
							onLaunchApp={this.launchApp}
						>
							{this.props.children}
						</DesktopView>
					</ThemeProvider>
				)}
			</ViewsProvider>
		);
	}
}

export default Desktop;
