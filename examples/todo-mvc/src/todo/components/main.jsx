import { useLocation } from "react-router-dom";

import { Item } from "./item";
import classnames from "classnames";

import { toggleAllTodos, useVisibleTodos } from "../reducer";

export function Main() {
    const { pathname: route } = useLocation();

    const visibleTodos = useVisibleTodos(route);

    return (
        <main className="main" data-testid="main">
            {visibleTodos.length > 0 ? (
                <div className="toggle-all-container">
                    <input className="toggle-all" type="checkbox" id="toggle-all" data-testid="toggle-all" checked={visibleTodos.every((todo) => todo.completed)} onChange={toggleAllTodos} />
                    <label className="toggle-all-label" htmlFor="toggle-all">
                        Toggle All Input
                    </label>
                </div>
            ) : null}
            <ul className={classnames("todo-list")} data-testid="todo-list">
                {visibleTodos.map((todo, index) => (
                    <Item todo={todo} key={todo.id} />
                ))}
            </ul>
        </main>
    );
}
