import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const noteSource = {
    beginDrag(props) {
        return {
            id: props.id
        };
    },
    isDragging(props, monitor) {
        return props.id === monitor.getItem().id;
    }
};

const noteTarget = {
    hover(targetProps, monitor) {
        const targetId = targetProps.id;
        const sourceProps = monitor.getItem();
        const sourceId = sourceProps.id;
        if (sourceId !== targetId) {
            targetProps.onMove({
                sourceId,
                targetId
            });
        }
    }
};

@DragSource(ItemTypes.NOTE, noteSource, (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging() // map isDragging() state to isDragging prop
    }))
@DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
    connectDropTarget: connect.dropTarget()
}))
class Note extends React.Component {
    constructor(props) {
        super(props);
        // Track `editing` state.
        this.state = {
            editing: false
        };
    }

    render() {
        const {connectDragSource, connectDropTarget, isDragging, onMove, id, ...props} = this.props;
        return connectDragSource(connectDropTarget(
            <li style={{
                opacity: isDragging ? 0 : 1
            }} {...props}>{props.children}</li>
        ));
    }

    renderEdit = () => {
        // Deal with blur and input handlers. These map to DOM events.
        return <input type="text"
            autoFocus={true}
            placeholder={this.props.task}
            onBlur={this.finishEdit}
            onKeyPress={this.checkEnter}/>;
    };
    renderNote = () => {
        const onDelete = this.props.onDelete;

        // If the user clicks a normal note, trigger editing logic.
        return (
            <div onClick={this.edit}>
                <span className="task">{this.props.task}</span>
                {onDelete ? this.renderDelete() : null}
            </div>
            );
    };
    renderDelete = () => {
        return <button
            className="delete-note"
            onClick={this.props.onDelete}>x</button>;
    };
    edit = () => {
        // Enter edit mode.
        this.setState({
            editing: true
        });
    };
    checkEnter = (e) => {
        // The user hit *enter*, let's finish up.
        if (e.key === 'Enter') {
            this.finishEdit(e);
        }
    };
    finishEdit = (e) => {
        // `Note` will trigger an optional `onEdit` callback once it
        // has a new value. We will use this to communicate the change to
        // `App`.
        //
        // A smarter way to deal with the default value would be to set
        // it through `defaultProps`.
        //
        // See *Typing with React* chapter for more information.
        if (this.props.onEdit) {
            this.props.onEdit(e.target.value);
        }
        // Exit edit mode.
        this.setState({
            editing: false
        });
    };
}

Note.propTypes = {
    id: React.PropTypes.string.isRequired,
    connectDragSource: React.PropTypes.func,
    connectDropTarget: React.PropTypes.func,
    isDragging: React.PropTypes.bool,
    onMove: React.PropTypes.func
};

Note.defaultProps = {
    onMove: () => {
    }
};

export default Note
