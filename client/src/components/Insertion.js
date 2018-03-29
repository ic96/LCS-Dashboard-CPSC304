import React from "react";
import request from "superagent";
import {CONSTANTS} from "../TableConstants";
import {Button} from 'reactstrap';

export default class Selection extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			tables: {selected:""},
			columns: {},
		}
		let tables = this.state.tables;
		tables["team"] = {attr: {team_name:"",head_coach:""}};
		tables["players"] = {attr: {pl_name:"",position:"",team_name:"",rating:1}};
		tables["champion"] = {attr: {ch_name:"",win_rate:0.5,pick_rate:0.5,ban_rate:0.5}};
		tables["game"] = {attr: {game_id:"",team_red:"",team_blue:"",game_time:1,result:"",duration:1,patch:""}};
		tables["game_stats"] = {attr: {game_id:"",first_blood:"",total_gold_red:1,total_gold_blue:1,total_champ_kill:1}};
		tables["player_stats"]= {attr: {pl_name:"",games_played:1,cs_per_min:1,assists:1,kda:0.5,minutes_played:1,cs_total:1,kills:1,deaths:1,kill_participation:1}};
		tables["team_stats"] = {attr: {team_name:"",games_played:1,wins:1,total_deaths:1,total_assists:1,avg_game_time:1}};
		tables["plays_in"] = {attr: {game_id:"",ch_name:"",pl_name:""}};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.buildQuery = this.buildQuery.bind(this);
		this.handleTableChanges = this.handleTableChanges.bind(this);
		this.handleInputChanges = this.handleInputChanges.bind(this);
		this.createTableOptions = this.createTableOptions.bind(this);
		this.createColumns = this.createColumns.bind(this);
	}

	handleSubmit(event) {
		let that = this;
		request
			.post('/api/query')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.query({query: that.buildQuery()})
			.end(function (err, res) {
				console.log(res.text);
				that.props.setData(JSON.parse(res.text));
				that.setState({
					queryResults: res,
					headerNames: that.state.columns.selected
				});
			});
		event.preventDefault();
	}
	handleTableChanges(event) {
		let { value } = event.target;
		const newTables = this.state.tables;
		newTables.selected = value;
		this.setState({tables: newTables, columns: {}});
	}
	handleInputChanges(event) {
		let { id,value } = event.target;
		let column = id.split(".")[1];
		const newColumns = this.state.columns;
		newColumns[column] = value;
		this.setState({columns: newColumns});
	}
	buildQuery() {
		let { tables,columns } = this.state;
		let insertClause = "insert into " + tables.selected + " (";
		let valueClause = "values (";
		let appended = false;
		for (let key in columns) {
			if (key === "selected") {
				continue;
			}
			if (appended) {
				insertClause = insertClause + ",";
				valueClause = valueClause + ",";
			}
			insertClause = insertClause + key;
			let dataType = tables[tables.selected].attr[key];
			if (dataType === "") {
				valueClause = valueClause + "\'" + columns[key] + "\'";
			} else {
				valueClause = valueClause + columns[key];
			}
			appended = true;
		}
		insertClause = insertClause + ") ";
		valueClause = valueClause + ")";
		let queryString = insertClause + valueClause + ";";
		return queryString;
	}


	/* CREATE OPTIONS */
	createTableOptions() {
		let items = [];
		let tables = CONSTANTS.TABLE_NAMES;

		tables.forEach(table => {
			items.push(<option key={table} value={table}>{table}</option>);
		});

		return items;
	}
	createColumns() {
		let items = [];
		let { tables, columns } = this.state;
		let table = tables.selected;
		let attributes = tables[table].attr;
		for (let key in attributes) {
			if (this.state.columns[key] === undefined) {
				this.state.columns[key] = attributes[key];
			}
			items.push(
				<p>
					{key+": "}
					<input
					  id={table+"."+key}
					  value={this.state.columns[key]}
					  type="text"
					  onChange={this.handleInputChanges}
					/>
				</p>
			);
		}
		return items;
	}

	render() {
		return (
		   <form onSubmit={this.handleSubmit}>
				<label>
					<header>Table:</header>
					<select 
					  multiple={false}
					  value={this.state.tables.selected}
					  onChange={this.handleTableChanges}>
						{this.createTableOptions()}
					</select>
				</label>
				<br/>
				<br/>
				{
					this.state.tables.selected !== ""
						&&
					<label>
						{this.createColumns()}
					</label>
				}
				<br/>
				<br/>
				{
					this.state.selectedTable !== ""
						&&
					<Button type="submit" color="success">Generate Query</Button>
				}
			</form>
		);
	}
}
