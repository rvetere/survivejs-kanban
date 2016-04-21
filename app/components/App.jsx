import uuid from 'node-uuid';
import AltContainer from 'alt-container';
import React from 'react';
import Lanes from './Lanes.jsx';
import LaneActions from '../actions/LaneActions';
import LaneStore from '../stores/LaneStore';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

@DragDropContext(HTML5Backend)
class App extends React.Component {
    render() {
        //debugger;
        return (
            <div>
                <button className="add-lane" onClick={this.addLane}>+</button>
                <AltContainer
            stores={[LaneStore]}
            inject={{
                lanes: () => LaneStore.getState().lanes
            }}
            >
                    <Lanes />
                </AltContainer>
            </div>
            );
    }

    addLane() {
        LaneActions.create({
            name: 'New lane'
        });
    }
}

export default App
