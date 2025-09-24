import { useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import classnames from "classnames";

import { REMOVE_COMPLETED_ITEMS } from "../constants";
import { useActiveTodosCount, useTotalTodosCount } from "../reducer";

export function Footer() {
    const { pathname: route } = useLocation();

    const activeTodosCount = useActiveTodosCount();
    const totalTodosCount = useTotalTodosCount();

    const removeCompleted = useCallback(() => dispatch({ type: REMOVE_COMPLETED_ITEMS }), [dispatch]);

    // prettier-ignore
    if (todos.length === 0)
        return null;

    return (
        <footer className="footer" data-testid="footer">
            <span className="todo-count">{`${activeTodosCount} ${activeTodosCount === 1 ? "item" : "items"} left!`}</span>
            <ul className="filters" data-testid="footer-navigation">
                <li>
                    <a className={classnames({ selected: route === "/" })} href="#/">
                        All
                    </a>
                </li>
                <li>
                    <a className={classnames({ selected: route === "/active" })} href="#/active">
                        Active
                    </a>
                </li>
                <li>
                    <a className={classnames({ selected: route === "/completed" })} href="#/completed">
                        Completed
                    </a>
                </li>
            </ul>
            <button className="clear-completed" disabled={activeTodosCount === totalTodosCount} onClick={removeCompleted}>
                Clear completed
            </button>
        </footer>
    );
}
