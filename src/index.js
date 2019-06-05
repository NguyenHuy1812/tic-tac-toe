import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import FacebookLogin from 'react-facebook-login';




class Square extends React.Component {
    render() {
        return (
            <button
                onClick={() => this.props.onClick()}
                className="square"
            >
                {this.props.value}
            </button>
        );
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
            xIsNext: true,
            countRound: 0,
            gamehistory: [],
            timeWinner: 0,
            highScore: []
        }
    }
    componentDidMount() {
        this.getData()
    }
    calculateWinner(squares) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    }
    getData = async () => {
        const api = (`http://ftw-highscores.herokuapp.com/tictactoe-dev/?reverse=true`);
        await fetch(api)
            .then(response => response.json())
            .then(data => {
                this.setState({
                    highScore: data.items
                })
            })
            .catch(error => {
            })
    }
    renderhighScore = () => {
        return this.state.highScore.map(({ player, score }) => {
            return (
                <div>
                    <p>Player Name:  {player} with {score} score</p>

                </div>

            )
        })
    }
    pushToServer = async (name, time) => {
        let data = new URLSearchParams();
        data.append('player', name);
        data.append('score', time);
        const url = `http://ftw-highscores.herokuapp.com/tictactoe-dev`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: data.toString(),
            json: true,
        })
        console.log('weed', response)
    }
    handleClick(i) {
        { this.handleHistory() }
        const squares = this.state.squares.slice();
        const countRound = this.state.countRound
        if (this.calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';

        this.setState({
            squares: squares,
            xIsNext: !this.state.xIsNext,
            countRound: countRound + 1,


        })
        if (!this.state.squares.some(square => square !== null)) {
            this.setState({
                timer: Date.now()
            })
        }
    }
    renderResetButton() {
        return this.setState({
            squares: Array(9).fill(null),
            xIsNext: true,
            countRound: 0,
            gamehistory: [],
            timeWinner: 0,
        })
    }
    handleHistory() {
        let store = {
            squares: this.state.squares,
            xIsNext: this.state.xIsNext,
        }

        return this.state.gamehistory = this.state.gamehistory.concat(store)


    }
    renderHistory() {
        return this.state.gamehistory.map((value, index) => {
            return (
                <button
                    onClick={() => this.setState({ squares: value.squares, xIsNext: value.xIsNext, gamehistory: this.state.gamehistory.slice(0, index) })}>
                    {`round` + index}</button>
            )
        }
        )
    }
    renderSquare(i) {
        return (
            <Square
                value={this.state.squares[i]}
                onClick={() => this.handleClick(i)}
            />
        )
    }
    render() {
        let status;
        const winner = this.calculateWinner(this.state.squares)
        if (winner) {
            this.state.timeWinner = (Date.now() - this.state.timer) / 1000
            this.pushToServer(this.props.name, this.state.timeWinner)

            status = 'Winner is : ' + winner + ` in ` + this.state.timeWinner + 's';
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        return (

            <div>
                <div className="status">{status}  </div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
                <div>
                    <button onClick={() => this.renderResetButton()}> Reset Gameeeeee</button>
                    {this.renderHistory()}
                    <p><b>List high score player</b></p>
                    {this.renderhighScore()}
                </div>

            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isSignIn: false, // remember to change to false after finish all
            userName: '',

        }
    }
    responseFacebook = (response) => {
       if(response){
           console.log('response',response)
        this.setState({
            isSignIn: true,
            userName: response.name,
        })
    }else {
        return console.log('wrong rtiuheiurghwieufgwiuyegfwef')
    }
}

    render() {
        if (this.state.isSignIn) {
            return (
                <div className="App">
                    <div className="game">
                        <div className="game-board">
                            <Board name={this.state.userName} />
                        </div>
                        <div className="game-info">

                            <ol>
                                <p>Current User: {this.state.userName} </p>
                            </ol>
                        </div>
                    </div>
                </div>
            );

        }
        return (
            <div className="App">
                <FacebookLogin
                    appId="2333210460284163"
                    fields="name,email,picture"
                    isSignIn={this.state.isSignIn}
                    callback={(arg) => this.responseFacebook(arg)}
                />

            </div>
        )
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
