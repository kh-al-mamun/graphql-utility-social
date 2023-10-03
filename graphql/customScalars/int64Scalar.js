import { GraphQLScalarType, Kind } from 'graphql';

const int64Scalar = new GraphQLScalarType({
    name: 'Int64',
    description: '64-bit integer custom scalar type',
    serialize: (value) => {
        // Ensure the value is a valid 64-bit integer
        const intValue = Number(value);
        if (Number.isSafeInteger(intValue)) {
            return intValue;
        }
        throw new Error('Int64 cannot represent non-integer value');
    },
    parseValue: (value) => {
        // Parse a value from the client as a 64-bit integer
        const intValue = Number(value);
        if (Number.isSafeInteger(intValue)) {
            return intValue;
        }
        throw new Error('Int64 cannot represent non-integer value');
    },
    parseLiteral: (ast) => {
        // Parse a literal value as a 64-bit integer
        if (ast.kind === Kind.INT) {
            const intValue = Number(ast.value);
            if (Number.isSafeInteger(intValue)) {
                return intValue;
            }
        }
        throw new Error('Int64 cannot represent non-integer value');
    },
});

const int64Resolver = {
    Int64: int64Scalar
}

export default int64Resolver;