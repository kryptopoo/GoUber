import React, { Component } from 'react'
import { browserHistory } from 'react-router'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { withWeb3 } from 'react-web3-provider';
import TruffleContract from 'truffle-contract'
import GoUberJson from '../../contracts/GoUber.json';
import css from '../../css/Trip.css';
import { myConfig } from '../../config.js';

// // define units
// const currency = "GO";
// const ether = 10 ** 18;	// 1 ether = 1000000000000000000 wei
// const pricePerKm = 0.01; 	// 0.1 ether

class OnTrip extends Component {
	constructor(props) {
		super(props);

		let bookingIndex = props.location.state.bookingId;
		let _this = this;
		let web3 = this.props.web3;

		// init contract
		this.contracts.GoUber = TruffleContract(GoUberJson);
		this.contracts.GoUber.setProvider(web3.currentProvider);

		// get account
		web3.eth.getAccounts(function (error, accounts) {
			if (error) {
				console.log(error);
			}

			let user = _this.state.user;
			user.account = accounts[0];
			_this.setState({ user: user });
		});

		// load trip info
		let contract = this.contracts.GoUber;
		contract.deployed().then(function (instance) {
			return instance.getBooking(bookingIndex);
		}).then(function (bookDetail) {
			let book = {
				id: bookingIndex,
				passengerAddress: bookDetail[0].toString(),
				passengerInfo: bookDetail[1].toString(),
				driverAddress: bookDetail[2].toString(),
				driverInfo: bookDetail[3].toString(),
				createdAt: parseFloat(bookDetail[4]),
				originLocation: bookDetail[5].toString(),
				destLocation: bookDetail[6].toString(),
				totalCost: parseFloat(bookDetail[7]),
				//passengerPaid: parseFloat(bookDetail[8]),
				status: bookDetail[8].toString()
			}

			_this.setState({ booking: book });

		}).catch(function (err) {
			console.log(err);
		});

		// handling events
		contract.deployed().then(function (instance) {
			let events = instance.allEvents()
			events.watch((err, result) => {
				if (result.event === "BookingCompleted") {
					_this.setState({ openDialog: true });
					console.log("BookingCompleted", result.args.bookingIndex.toString());
					//events.stopWatching();

				}
			})
		}).catch(function (err) {
			console.log(err.message);
		});
	}

	state = {
		openDialog: false,
		user: {
			name: sessionStorage.getItem("name"),
			phone: sessionStorage.getItem("phone"),
			type: sessionStorage.getItem("type"),
			account: ""
		},
		booking: {
			id: 0,
			passengerAddress: "",
			passengerInfo: "",
			driverAddress: "",
			driverInfo: "",
			createdAt: 0,
			originLocation: "",
			destLocation: "",
			totalCost: 0,
			status: "",
		},
	};

	componentDidMount() {
		document.title = "GoUber - " + this.state.user.type;
	}

	contracts = {};

	onCompleteBooking = () => {
		let _this = this;
		let bookingIndex = this.state.booking.id;
		let contract = this.contracts.GoUber;
		contract.deployed().then(function (instance) {
			return instance.completeBooking(bookingIndex, { from: _this.state.user.account });
		}).then(function (result) {
			console.log("complete booking result", result);
		}).catch(function (err) {
			console.log(err.message);
		});
	};

	onOkDialogClicked = () => {
		browserHistory.push('/booking');
	}

	render() {
		return (
			<div>
				<AppBar position="static">
					<Toolbar>
						<Typography variant="h5" align="center" color="secondary">
							You are on Trip
            </Typography>
					</Toolbar>
				</AppBar>
				<Paper >
					<Table>
						{/* <TableHead>
							<TableRow>
								<TableCell colSpan={2} >
									<Typography variant="h6" >
										Your Trip
                  </Typography>
								</TableCell>
							</TableRow>
						</TableHead> */}
						<TableBody>
							<TableRow>
								<TableCell>Passenger Name</TableCell>
								<TableCell>{this.state.booking.passengerInfo.split(";")[0]}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Passenger Phone</TableCell>
								<TableCell>{this.state.booking.passengerInfo.split(";")[1]}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Driver Name</TableCell>
								<TableCell>{this.state.booking.driverInfo.split(";")[0]}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Driver Phone</TableCell>
								<TableCell>{this.state.booking.driverInfo.split(";")[1]}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Route</TableCell>
								<TableCell>
									{this.state.booking.originLocation.split(";")[2]} <br />
									{this.state.booking.destLocation.split(";")[2]}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Booking Time</TableCell>
								<TableCell>
									{new Date(this.state.booking.createdAt * 1000).toISOString()}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Total Cost</TableCell>
								<TableCell>{(this.state.booking.totalCost / myConfig.etherWeiRate).toFixed(2)} {myConfig.currency}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Status</TableCell>
								<TableCell><span className="status">{this.state.booking.status}</span></TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</Paper>
				<Button variant="contained" color="primary" fullWidth onClick={this.onCompleteBooking} disabled={this.state.user.type === "driver"}>
					Complete Trip
        </Button>

				{/* completed trip dialog */}
				<Dialog open={this.state.openDialog} onClose={this.onDialogClosed} disableBackdropClick aria-labelledby="form-dialog-title">
					<DialogTitle id="form-dialog-title">End Trip</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Your trip has been completed!
            </DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.onOkDialogClicked} color="primary">
							Back To Booking
            </Button>
					</DialogActions>
				</Dialog>
			</div>
		)
	}
}

export default withWeb3(OnTrip)
