import { routerReducer as routing, RouteActions } from 'react-router-redux';
import { combineReducers, Reducer } from 'redux';
import editor from './editor';

export interface RootState {
  routing: RouteActions;
  editor: CodePanelData;
}

export default combineReducers<RootState>({
  routing,
  editor
});
