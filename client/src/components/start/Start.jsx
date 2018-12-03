import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router'
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

function TabContainer(props) {
	return (
		<Typography component="div" style={{ padding: 8 * 3 }}>
			{props.children}
		</Typography>
	);
}

TabContainer.propTypes = {
	children: PropTypes.node.isRequired,
};

class Start extends Component {

	state = {
		tabIndex: 0,
		driverName: "",
		driverPhone: "",
		passengerName: "",
		passengerPhone: "",
		passengerNameTextField: { error: false, helperText: "" },
		passengerPhoneTextField: { error: false, helperText: "" },
		driverNameTextField: { error: false, helperText: "" },
		driverPhoneTextField: { error: false, helperText: "" }
	};

	onTabChanged = (event, value) => {
		this.setState({ tabIndex: value });
	};

	onPassengerNameChanged = (e) => {
		this.setState({ passengerName: e.target.value });
		this.validate("passengerNameTextField", e.target.value);
	}

	onPassengerPhoneChanged = (e) => {
		this.setState({ passengerPhone: e.target.value });
		this.validate("passengerPhoneTextField", e.target.value);
	}

	onDriverNameChanged = (e) => {
		this.setState({ driverName: e.target.value });
		this.validate("driverNameTextField", e.target.value);
	}

	onDriverPhoneChanged = (e) => {
		this.setState({ driverPhone: e.target.value });
		this.validate("driverPhoneTextField", e.target.value);
	}

	onDriverStartClicked = () => {
		this.validate("driverNameTextField", this.state.driverName);
		this.validate("driverPhoneTextField", this.state.driverPhone);

		sessionStorage.setItem("name", this.state.driverName);
		sessionStorage.setItem("phone", this.state.driverPhone);
		sessionStorage.setItem("type", "driver");

		if (this.state.driverName !== "" && this.state.driverPhone !== "") {
			browserHistory.push('/booking');
		}
	};

	onPassengerStartClicked = () => {
		this.validate("passengerNameTextField", this.state.passengerName);
		this.validate("passengerPhoneTextField", this.state.passengerPhone);

		sessionStorage.setItem("name", this.state.passengerName);
		sessionStorage.setItem("phone", this.state.passengerPhone);
		sessionStorage.setItem("type", "passenger");

		if (this.state.passengerName !== "" && this.state.passengerPhone !== "") {
			browserHistory.push('/booking');
		}
	};

	validate = (name, value) => {
		if (name === "passengerNameTextField") {
			let required = value === "";
			this.setState({
				passengerNameTextField: {
					error: required,
					helperText: required ? "This field is required." : ""
				}
			});
		}
		else if (name === "passengerPhoneTextField") {
			let required = value === "";
			this.setState({
				passengerPhoneTextField: {
					error: required,
					helperText: required ? "This field is required." : ""
				}
			});
		}
		else if (name === "driverNameTextField") {
			let required = value === "";
			this.setState({
				driverNameTextField: {
					error: required,
					helperText: required ? "This field is required." : ""
				}
			});
		}
		else if (name === "driverPhoneTextField") {
			let required = value === "";
			this.setState({
				driverPhoneTextField: {
					error: required,
					helperText: required ? "This field is required." : ""
				}
			});
		}
	}

	render() {
		const { tabIndex } = this.state;
		return (
			<div>
				<AppBar position="static">
					<Tabs value={tabIndex} onChange={this.onTabChanged} centered fullWidth>
						<Tab label="Passenger" />
						<Tab label="Driver" />
					</Tabs>
				</AppBar>
				{tabIndex === 0 &&
					<TabContainer>
						<Card>
							<CardContent>
								<Typography variant="h5" component="h2">
									You are Passenger
                </Typography>
								<TextField id="passenger-name" label="Name" margin="normal" required
									error={this.state.passengerNameTextField.error} helperText={this.state.passengerNameTextField.helperText}
									fullWidth onChange={this.onPassengerNameChanged} />
								<TextField id="passenger-phone" label="Phone" margin="normal" required
									error={this.state.passengerPhoneTextField.error} helperText={this.state.passengerPhoneTextField.helperText}
									fullWidth onChange={this.onPassengerPhoneChanged} />
							</CardContent>
							<CardActions>
								<Button variant="contained" color="primary" fullWidth onClick={this.onPassengerStartClicked}>Start</Button>
							</CardActions>
						</Card>
					</TabContainer>}
				{tabIndex === 1 &&
					<TabContainer>
						<Card>
							<CardContent>
								<Typography variant="h5" component="h2">
									You are Driver
                </Typography>
								<TextField id="driver-name" label="Name" margin="normal" fullWidth required
									error={this.state.driverNameTextField.error} helperText={this.state.driverNameTextField.helperText}
									onChange={this.onDriverNameChanged} />
								<TextField id="driver-phone" label="Phone" margin="normal" fullWidth required
									error={this.state.driverPhoneTextField.error} helperText={this.state.driverPhoneTextField.helperText}
									onChange={this.onDriverPhoneChanged} />
							</CardContent>
							<CardActions>
								<Button variant="contained" color="secondary" fullWidth onClick={this.onDriverStartClicked}>Start</Button>
							</CardActions>
						</Card>
					</TabContainer>}
			</div>
		)
	}
}

export default Start;
