import React, { Component } from 'react'
import { browserHistory } from 'react-router'

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import LocationSearchInput from './LocationSearchInput';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { withWeb3 } from 'react-web3-provider';
import TruffleContract from 'truffle-contract'
import GoUberJson from '../../contracts/GoUber.json';
import css from '../../css/Booking.css';

// define units
const currency = "GO";
const ether = 10 ** 18;	// 1 ether = 1000000000000000000 wei
const pricePerKm = 0.05; 	// 0.1 ether

class Booking extends Component {
	constructor(props) {
		super(props);

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

		// load bookings
		this.loadBookingList();

		// handling events
		let contract = this.contracts.GoUber;
		contract.deployed().then(function (instance) {
			let events = instance.allEvents({toBlock: 'latest'});
			events.watch((err, result) => {
				if (result.event === "BookingCreated") {
					_this.setState({ openNewBookingDialog: false });
					_this.loadBookingList();
					console.log("BookingCreated", result)
				}
				if (result.event === "BookingCancelled") {
					_this.updateBookingStatus(result.args.bookingIndex, "cancelled");
					console.log("BookingCancelled", result)
				}
				if (result.event === "BookingAccepted") {
					//events.stopWatching();
					browserHistory.push({
						pathname: '/trip',
						state: { bookingId: result.args.bookingIndex }
					})
				}
				if (result.event === "BookingCompleted") {
					console.log("BookingCompleted", result.args.bookingIndex.toString());
				}
			})
		}).catch(function (err) {
			console.log(err.message);
		});
	}

	contracts = {};

	state = {
		openNewBookingDialog: false,
		user: {
			name: sessionStorage.getItem("name"),
			phone: sessionStorage.getItem("phone"),
			type: sessionStorage.getItem("type"),
			account: ""
		},
		newBook: {
			originLocation: "",
			destLocation: "",
			distance: 0,
			totalCost: 0,
			pricePerKm: pricePerKm
		},
		books: []
	};

	loadBookingList = () => {
		let _this = this;
		_this.setState({ books: [] });
		_this.reqBookingList();
		
	}

	updateBookingStatus = (index, status) => {
		let _this = this;
		let books = _this.state.books;
		if (books[index] !== undefined){
			books[index].status = status;
			_this.setState({ books: books });
		}
	
	}

	reqBookingList = () => {
		let _this = this;
		let contract = this.contracts.GoUber;
		contract.deployed().then(function (instance) {			
			return instance.getBookingCount();
		}).then(function (result) {
			for (let i = 0; i < result; i++) {
				let index = i;

				contract.deployed().then(function (instance) {
					return instance.getBooking(index);
				}).then(function (bookDetail) {
					let book = {
						id: i,
						passengerAddress: bookDetail[0].toString(),
						passengerInfo: bookDetail[1].toString(),
						driverAddress: bookDetail[2].toString(),
						driverInfo: bookDetail[3].toString(),
						createdAt: parseFloat(bookDetail[4]),
						originLocation: bookDetail[5].toString(),
						destLocation: bookDetail[6].toString(),
						totalCost: parseFloat(bookDetail[7]),
						status: bookDetail[8].toString()
					}
					let books = _this.state.books;
					books.push(book);
					_this.setState({ books: books });
				}).catch(function (err) {
					console.log(err);
				});
			}
		}).catch(function (err) {
			console.log(err);
		});
	}

	componentDidMount() {
		document.title = "GoUber - " + this.state.user.type.toUpperCase();
	}

	calculateDistance = () => {
		if (this.state.newBook.originLocation === "" || this.state.newBook.destLocation === "")
			return 0;

		let lat1 = parseFloat(this.state.newBook.originLocation.split(";")[0]);
		let lat2 = parseFloat(this.state.newBook.destLocation.split(";")[0]);;
		let lon1 = parseFloat(this.state.newBook.originLocation.split(";")[1]);
		let lon2 = parseFloat(this.state.newBook.destLocation.split(";")[1]);
		let unit = "K";
		if ((lat1 === lat2) && (lon1 === lon2)) {
			return 0;
		}
		else {
			var radlat1 = Math.PI * lat1 / 180;
			var radlat2 = Math.PI * lat2 / 180;
			var theta = lon1 - lon2;
			var radtheta = Math.PI * theta / 180;
			var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
			if (dist > 1) {
				dist = 1;
			}
			dist = Math.acos(dist);
			dist = dist * 180 / Math.PI;
			dist = dist * 60 * 1.1515;
			if (unit === "K") { dist = dist * 1.609344 }
			if (unit === "N") { dist = dist * 0.8684 }
			return dist;
		}
	};

	searchOriginCallback = (latLng, address) => {
		let _this = this;
		let location = latLng.lat + ";" + latLng.lng + ";" + address;
		let newBook = this.state.newBook;
		newBook.originLocation = location;
		this.setState({ newBook: newBook }, () => {
			let distance = _this.calculateDistance();
			let newBook = _this.state.newBook;
			newBook.distance = parseFloat(distance.toFixed(2));
			newBook.totalCost = parseFloat((newBook.distance * newBook.pricePerKm).toFixed(8));
			_this.setState({ newBook: newBook });
		});
	};

	searchDestinationCallback = (latLng, address) => {
		console.log(latLng);
		let _this = this;
		let location = latLng.lat + ";" + latLng.lng + ";" + address;
		let newBook = this.state.newBook;
		newBook.destLocation = location;
		this.setState({ newBook: newBook }, () => {
			let distance = _this.calculateDistance();
			let newBook = _this.state.newBook;
			newBook.distance = parseFloat(distance.toFixed(2));
			newBook.totalCost = parseFloat((newBook.distance * newBook.pricePerKm).toFixed(8));
			_this.setState({ newBook: newBook });
		});
	};

	onNewBookingClosed = () => {
		this.setState({ openNewBookingDialog: false });
	};

	onNewBookingClicked = () => {
		let newBook = this.state.newBook;
		newBook = {
			originLocation: "",
			destLocation: "",
			distance: 0,
			totalCost: 0,
			pricePerKm: pricePerKm
		}
		this.setState({ newBook: newBook });
		this.setState({ openNewBookingDialog: true });
	};

	onSubmitNewBoking = () => {
		let _this = this;

		// validation
		if (_this.state.newBook.originLocation === "" || _this.state.newBook.destLocation === ""
			|| _this.state.newBook.distance === 0 || _this.state.newBook.pricePerKm === 0) return;

		let web3 = this.props.web3;
		let contract = this.contracts.GoUber;
		web3.eth.getAccounts(function (error, accounts) {
			if (error) {
				console.log(error);
			}

			// create booking
			var senderAccount = accounts[0];
			//var ether = 10 ** 18; 
			var amount = _this.state.newBook.totalCost * ether;
			var distance = _this.state.newBook.distance;
			//var gas = 1000000;
			contract.deployed().then(function (instance) {
				return instance.createBooking(_this.state.user.name + ";" + _this.state.user.phone,
					_this.state.newBook.originLocation, _this.state.newBook.destLocation,
					{ from: senderAccount, value: amount});
			}).then(function (result) {
			}).catch(function (err) {
				console.log(err.message);
			});
		});
	};


	onCancelBooking = (bookingIndex) => {
		let _this = this;
		let contract = this.contracts.GoUber;
		contract.deployed().then(function (instance) {
			return instance.cancelBooking(bookingIndex, { from: _this.state.user.account });
		}).then(function (result) {
		}).catch(function (err) {
			console.log(err.message);
		});
	}

	onAcceptBooking = (bookingIndex) => {
		let _this = this;
		let driverInfo = this.state.user.name + ";" + this.state.user.phone;
		let contract = this.contracts.GoUber;
		contract.deployed().then(function (instance) {
			return instance.acceptBooking(bookingIndex, driverInfo, { from: _this.state.user.account });
		}).then(function (result) {
		}).catch(function (err) {
			console.log(err.message);
		});
	};

	render() {
		return (
			<div>
				<AppBar position="static">
					<Toolbar>
						<Typography variant="h5" align="center" color="secondary" >
							Booking
            </Typography>
					</Toolbar>
				</AppBar>
				<Paper >
					<Table padding="none">
						<TableHead>
							<TableRow>
								<TableCell>Route</TableCell>
								<TableCell>Passenger</TableCell>
								<TableCell></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.books.map(book => {
								return (
									<TableRow key={book.id}>
										<TableCell className="route" >
											{book.originLocation.split(";")[2]} <br />
											{book.destLocation.split(";")[2]}
										</TableCell>
										<TableCell className="passenger">
											{book.passengerInfo.split(";")[0]} <br />
											{book.passengerInfo.split(";")[1]}
											{/* {book.passengerAddress} */}
										</TableCell>
										<TableCell className="cost">
											{(book.totalCost / ether).toFixed(2)} {currency}<br />
											{/* {book.status} */}
											<Button disabled={book.status === "cancelled" || book.status === "completed"}
												style={book.status !== "new" ? {} : { display: 'none' }}
											>
												{book.status}
											</Button>
											<Button size="small" color="secondary" className="btn-cancel"
												style={this.state.user.type === "passenger" && book.status === "new" ? {} : { display: 'none' }}
												onClick={() => { this.onCancelBooking(book.id) }} >
												Cancel
                      </Button>
											<Button size="small" color="primary" className="btn-accept"
												style={this.state.user.type === "driver" && book.status === "new" ? {} : { display: 'none' }}
												onClick={() => { this.onAcceptBooking(book.id) }}>
												Accept
                      </Button>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</Paper>
				<Fab color="primary" aria-label="Add" className="fab" onClick={this.onNewBookingClicked}
					style={this.state.user.type === "passenger" ? {} : { display: 'none' }}
				>
					<AddIcon />
				</Fab>

				<Dialog open={this.state.openNewBookingDialog} onClose={this.onNewBookingClosed} disableBackdropClick aria-labelledby="form-dialog-title">
					<DialogTitle id="form-dialog-title">Booking</DialogTitle>
					<DialogContent>
						<DialogContentText>
							To book a trip, please enter your locations...
            </DialogContentText>
						<LocationSearchInput id="origin-search" searchLabel="Pickup..." callbackFromParent={this.searchOriginCallback} ></LocationSearchInput>
						<LocationSearchInput id="destination-search" searchLabel="Destination..." callbackFromParent={this.searchDestinationCallback}></LocationSearchInput>
						<div className="distance-result">
							<div> Distance: <span className="number-label">{this.state.newBook.distance}</span><span className="unit">Km</span></div>
							<div> Fee: <span className="number-label">{this.state.newBook.pricePerKm} </span><span className="unit">{currency}/Km</span></div>
							<div> Total Cost: <span className="number-label">{this.state.newBook.totalCost}</span><span className="unit">{currency}</span></div>
						</div>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.onNewBookingClosed} color="primary">
							Cancel
            </Button>
						<Button onClick={this.onSubmitNewBoking} color="primary">
							Book
            </Button>
					</DialogActions>
				</Dialog>
			</div>
		)
	}
}

export default withWeb3(Booking)
