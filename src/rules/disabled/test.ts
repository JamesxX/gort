import action from '../../core/action.class';
import { ban } from '../../core/actions';
import { countable, listable } from '../../core/condition.class';
import { arrayIncludesAny } from '../../core/conditionals/array';
import { and, or } from '../../core/conditionals/logic';
import { greaterThan } from '../../core/conditionals/relational';
import ruleBase, { targetType } from '../../core/rule.class';

export class testRule extends ruleBase {
	name: string = 'Test Rule';
	targetType: targetType = 'Both';

	Condition = new and(
		new or(
			new arrayIncludesAny(
				new listable(['hello', 'world']),
				new listable(['world'])
			),

			new greaterThan(new countable(1), new countable(2))
		)
	);

	Action: action = new ban({});
}

export default { rules: [new testRule()] };
